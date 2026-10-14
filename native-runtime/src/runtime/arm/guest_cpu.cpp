#include "mc3/arm/guest_cpu.hpp"

#include "mc3/log.hpp"

#if defined(MC3_HAVE_DYNARMIC)

#include <dynarmic/interface/A32/a32.h>
#include <dynarmic/interface/A32/config.h>
#include <dynarmic/interface/halt_reason.h>

#include <array>
#include <cstdint>
#include <cstring>
#include <memory>
#include <stdexcept>
#include <string>
#include <utility>

namespace mc3::arm {

namespace {

constexpr std::uint8_t kSvcImport = 0xFF;
constexpr std::uint8_t kSvcReturn = 0xFE;

class Callbacks final : public Dynarmic::A32::UserCallbacks {
public:
    explicit Callbacks(loader::GuestMemory* memory)
        : memory_(memory) {}

    Dynarmic::A32::Jit* cpu = nullptr;
    GuestCpu* owner = nullptr;
    loader::GuestMemory* memory_ = nullptr;
    SvcHandler svc_handler{};
    std::uint64_t ticks_remaining = 0;
    bool faulted = false;
    bool returned_from_call = false;

    std::uint8_t MemoryRead8(std::uint32_t address) override {
        const auto* value = memory_ ? memory_->data(address) : nullptr;
        if (!value) {
            faulted = true;
            return 0;
        }
        return *value;
    }

    std::uint16_t MemoryRead16(std::uint32_t address) override {
        if (!memory_ || !memory_->contains(address, sizeof(std::uint16_t))) {
            faulted = true;
            return 0;
        }

        std::uint16_t value = 0;
        std::memcpy(&value, memory_->data(address), sizeof(value));
        return value;
    }

    std::uint32_t MemoryRead32(std::uint32_t address) override {
        if (!memory_ || !memory_->contains(address, sizeof(std::uint32_t))) {
            faulted = true;
            return 0;
        }

        std::uint32_t value = 0;
        std::memcpy(&value, memory_->data(address), sizeof(value));
        return value;
    }

    std::uint64_t MemoryRead64(std::uint32_t address) override {
        if (!memory_ || !memory_->contains(address, sizeof(std::uint64_t))) {
            faulted = true;
            return 0;
        }

        std::uint64_t value = 0;
        std::memcpy(&value, memory_->data(address), sizeof(value));
        return value;
    }

    void MemoryWrite8(
        std::uint32_t address,
        std::uint8_t value
    ) override {
        if (!memory_ || !memory_->write(address, &value, sizeof(value))) {
            faulted = true;
        }
    }

    void MemoryWrite16(
        std::uint32_t address,
        std::uint16_t value
    ) override {
        if (!memory_ || !memory_->write(address, &value, sizeof(value))) {
            faulted = true;
        }
    }

    void MemoryWrite32(
        std::uint32_t address,
        std::uint32_t value
    ) override {
        if (!memory_ || !memory_->write(address, &value, sizeof(value))) {
            faulted = true;
        }
    }

    void MemoryWrite64(
        std::uint32_t address,
        std::uint64_t value
    ) override {
        if (!memory_ || !memory_->write(address, &value, sizeof(value))) {
            faulted = true;
        }
    }

    void InterpreterFallback(
        std::uint32_t pc,
        std::size_t num_instructions
    ) override {
        faulted = true;
        log_error(
            "Dynarmic interpreter fallback at 0x" +
            std::to_string(pc) +
            " for " +
            std::to_string(num_instructions) +
            " instructions"
        );
    }

    void CallSVC(std::uint32_t swi) override {
        if (swi == kSvcReturn) {
            returned_from_call = true;
            if (cpu) {
                cpu->HaltExecution(
                    Dynarmic::HaltReason::UserDefined1
                );
            }
            return;
        }

        if (swi == kSvcImport) {
            if (!svc_handler || !owner) {
                faulted = true;
                log_error("Guest import SVC invoked without a handler.");
                if (cpu) {
                    cpu->HaltExecution(
                        Dynarmic::HaltReason::UserDefined1
                    );
                }
                return;
            }

            svc_handler(swi, *owner);
            return;
        }

        faulted = true;
        log_error(
            "Unhandled guest SVC #" +
            std::to_string(swi)
        );

        if (cpu) {
            cpu->HaltExecution(
                Dynarmic::HaltReason::UserDefined1
            );
        }
    }

    void ExceptionRaised(
        std::uint32_t pc,
        Dynarmic::A32::Exception exception
    ) override {
        faulted = true;
        log_error(
            "Guest ARM exception at 0x" +
            std::to_string(pc) +
            " code=" +
            std::to_string(static_cast<unsigned>(exception))
        );
    }

    void AddTicks(std::uint64_t ticks) override {
        ticks_remaining =
            ticks > ticks_remaining
                ? 0
                : ticks_remaining - ticks;
    }

    std::uint64_t GetTicksRemaining() override {
        return ticks_remaining;
    }
};

} // namespace

struct GuestCpu::Impl {
    explicit Impl(loader::GuestMemory* memory, GuestCpu* owner)
        : callbacks(memory) {
        callbacks.owner = owner;
        callbacks.memory_ = memory;

        Dynarmic::A32::UserConfig config{};
        config.callbacks = &callbacks;
        config.arch_version = Dynarmic::A32::ArchVersion::v7;

        cpu = std::make_unique<Dynarmic::A32::Jit>(config);
        callbacks.cpu = cpu.get();
    }

    std::unique_ptr<Dynarmic::A32::Jit> cpu;
    Callbacks callbacks;
    std::uint32_t stack_top = 0;
};

GuestCpu::GuestCpu()
    : impl_(nullptr) {}

GuestCpu::~GuestCpu() = default;
GuestCpu::GuestCpu(GuestCpu&&) noexcept = default;
GuestCpu& GuestCpu::operator=(GuestCpu&&) noexcept = default;

bool GuestCpu::initialize(loader::GuestMemory* memory) {
    if (!memory) {
        return false;
    }

    try {
        impl_ = std::make_unique<Impl>(memory, this);

        constexpr std::size_t kGuestStackSize = 8u * 1024u * 1024u;
        const auto stack =
            memory->allocate_tail(
                kGuestStackSize,
                loader::GuestMemory::PageSize
            );

        if (!stack) {
            log_error("Failed to allocate ARM guest stack.");
            impl_.reset();
            return false;
        }

        const auto raw_top =
            static_cast<std::uint64_t>(*stack) + kGuestStackSize;
        if (raw_top > 0xFFFFFFFFull) {
            log_error("ARM guest stack address overflow.");
            impl_.reset();
            return false;
        }

        impl_->stack_top =
            static_cast<std::uint32_t>(raw_top) & ~0x7u;

        if (!memory->contains(
                impl_->stack_top - 0x100,
                0x100
            )) {
            log_error("ARM guest stack is outside guest memory.");
            impl_.reset();
            return false;
        }

        return true;
    } catch (const std::exception& error) {
        log_error(
            std::string("Failed to initialize Dynarmic guest CPU: ") +
            error.what()
        );
        impl_.reset();
        return false;
    }
}

bool GuestCpu::run(
    std::uint32_t entry,
    bool thumb,
    std::uint64_t ticks
) {
    if (!impl_ || !impl_->cpu) {
        return false;
    }

    impl_->callbacks.faulted = false;
    impl_->callbacks.returned_from_call = false;
    impl_->callbacks.ticks_remaining = ticks;

    for (std::size_t i = 0; i < 13; ++i) {
        impl_->cpu->Regs()[i] = 0;
    }

    impl_->cpu->Regs()[13] =
        impl_->stack_top - 0x100;

    impl_->cpu->Regs()[14] =
        impl_->stack_top |
        (thumb ? 1u : 0u);

    impl_->cpu->Regs()[15] = entry;
    impl_->cpu->SetCpsr(
        0x00000010u |
        (thumb ? 0x00000020u : 0u)
    );

    impl_->cpu->Run();

    return !impl_->callbacks.faulted;
}

bool GuestCpu::call(
    std::uint32_t entry,
    bool thumb,
    std::span<const std::uint32_t> arguments
) {
    if (!impl_ || !impl_->cpu || !impl_->callbacks.memory_) {
        return false;
    }

    const auto return_stub =
        impl_->callbacks.memory_->allocate_tail(
            4,
            loader::GuestMemory::PageSize
        );

    if (!return_stub) {
        log_error("Failed to allocate ARM guest return trampoline.");
        return false;
    }

    if (thumb) {
        const std::uint16_t svc = 0xDFFE;
        if (!impl_->callbacks.memory_->write(
                *return_stub,
                &svc,
                sizeof(svc)
            )) {
            return false;
        }
    } else {
        const std::uint32_t svc = 0xEF0000FEu;
        if (!impl_->callbacks.memory_->write(
                *return_stub,
                &svc,
                sizeof(svc)
            )) {
            return false;
        }
    }

    impl_->callbacks.faulted = false;
    impl_->callbacks.returned_from_call = false;
    constexpr std::uint64_t kCallTickBudget = 10000000;
    impl_->callbacks.ticks_remaining = kCallTickBudget;

    for (std::size_t i = 0; i < 13; ++i) {
        impl_->cpu->Regs()[i] = 0;
    }

    const std::size_t stack_argument_count =
        arguments.size() > 4 ? arguments.size() - 4 : 0;
    const std::size_t stack_argument_bytes =
        stack_argument_count * sizeof(std::uint32_t);

    if (stack_argument_bytes > 0x1000 ||
        impl_->stack_top < 0x100 + stack_argument_bytes) {
        log_error("ARM guest call has too many stack arguments.");
        return false;
    }

    const auto stack_pointer =
        impl_->stack_top -
        0x100 -
        static_cast<std::uint32_t>(stack_argument_bytes);

    if (!impl_->callbacks.memory_->contains(
            stack_pointer,
            stack_argument_bytes
        )) {
        log_error("ARM guest call stack arguments are outside guest memory.");
        return false;
    }

    for (std::size_t i = 0; i < stack_argument_count; ++i) {
        const auto value = arguments[i + 4];
        if (!impl_->callbacks.memory_->write(
                stack_pointer +
                    static_cast<std::uint32_t>(
                        i * sizeof(std::uint32_t)
                    ),
                &value,
                sizeof(value)
            )) {
            log_error("Failed to write ARM guest call stack argument.");
            return false;
        }
    }

    impl_->cpu->Regs()[13] = stack_pointer;
    impl_->cpu->Regs()[14] =
        *return_stub |
        (thumb ? 1u : 0u);

    for (std::size_t i = 0; i < arguments.size() && i < 4; ++i) {
        impl_->cpu->Regs()[i] = arguments[i];
    }

    impl_->cpu->Regs()[15] = entry;
    impl_->cpu->SetCpsr(
        0x00000010u |
        (thumb ? 0x00000020u : 0u)
    );

    impl_->cpu->Run();

    return
        !impl_->callbacks.faulted &&
        impl_->callbacks.returned_from_call;
}

void GuestCpu::set_svc_handler(SvcHandler handler) {
    if (impl_) {
        impl_->callbacks.svc_handler = std::move(handler);
    }
}

std::uint32_t GuestCpu::register_value(std::size_t index) const {
    if (!impl_ || !impl_->cpu || index >= 16) {
        return 0;
    }
    return impl_->cpu->Regs()[index];
}

void GuestCpu::set_register(
    std::size_t index,
    std::uint32_t value
) {
    if (!impl_ || !impl_->cpu || index >= 16) {
        return;
    }
    impl_->cpu->Regs()[index] = value;
}

std::uint32_t GuestCpu::program_counter() const {
    return register_value(15);
}

bool GuestCpu::faulted() const {
    return !impl_ || impl_->callbacks.faulted;
}

bool GuestCpu::returned_from_call() const {
    return impl_ && impl_->callbacks.returned_from_call;
}

void GuestCpu::clear_fault() {
    if (impl_) {
        impl_->callbacks.faulted = false;
        impl_->callbacks.returned_from_call = false;
    }
}

} // namespace mc3::arm

#else

#include <array>
#include <cstring>
#include <utility>

namespace mc3::arm {

struct GuestCpu::Impl {
    loader::GuestMemory* memory = nullptr;
    std::array<std::uint32_t, 16> registers{};
    SvcHandler svc_handler{};
    bool faulted = false;
    bool returned_from_call = false;
};

GuestCpu::GuestCpu() : impl_(std::make_unique<Impl>()) {}
GuestCpu::~GuestCpu() = default;
GuestCpu::GuestCpu(GuestCpu&&) noexcept = default;
GuestCpu& GuestCpu::operator=(GuestCpu&&) noexcept = default;

bool GuestCpu::initialize(loader::GuestMemory* memory) {
    if (!memory) {
        return false;
    }
    if (!impl_) {
        impl_ = std::make_unique<Impl>();
    }
    impl_->memory = memory;
    impl_->registers.fill(0);
    impl_->faulted = false;
    impl_->returned_from_call = false;
    return true;
}

bool GuestCpu::run(
    std::uint32_t entry,
    bool thumb,
    std::uint64_t ticks
) {
    if (!impl_ || !impl_->memory) {
        return false;
    }

    impl_->registers[15] = entry;
    impl_->faulted = false;
    impl_->returned_from_call = false;

    for (std::uint64_t step = 0; step < ticks; ++step) {
        const std::uint32_t pc = impl_->registers[15];

        if (pc == 0xFFFFFFFEu || pc == 0) {
            impl_->returned_from_call = true;
            return true;
        }

        if (thumb) {
            if (!impl_->memory->contains(pc, sizeof(std::uint16_t))) {
                impl_->faulted = true;
                return false;
            }

            std::uint16_t op = 0;
            std::memcpy(&op, impl_->memory->data(pc), sizeof(op));
            impl_->registers[15] += 2;

            // Shift (immediate) or Add/subtract register/immediate (000xx)
            if ((op & 0xE000) == 0x0000) {
                const unsigned op_type = (op >> 11) & 3;
                const unsigned imm5 = (op >> 6) & 0x1F;
                const unsigned rm = (op >> 3) & 0x7;
                const unsigned rd = op & 0x7;

                if (op_type == 0) { // LSLS
                    impl_->registers[rd] = (imm5 == 0) ? impl_->registers[rm] : (impl_->registers[rm] << imm5);
                } else if (op_type == 1) { // LSRS
                    impl_->registers[rd] = (imm5 == 0) ? 0 : (impl_->registers[rm] >> imm5);
                } else if (op_type == 2) { // ASRS
                    impl_->registers[rd] = (imm5 == 0)
                        ? (static_cast<std::int32_t>(impl_->registers[rm]) < 0 ? 0xFFFFFFFFu : 0)
                        : static_cast<std::uint32_t>(static_cast<std::int32_t>(impl_->registers[rm]) >> imm5);
                } else { // op_type == 3: Add/Subtract
                    const unsigned sub_op = (op >> 9) & 3;
                    const unsigned rn = (op >> 6) & 7;
                    if (sub_op == 0) impl_->registers[rd] = impl_->registers[rn] + impl_->registers[rm];
                    else if (sub_op == 1) impl_->registers[rd] = impl_->registers[rn] - impl_->registers[rm];
                    else if (sub_op == 2) impl_->registers[rd] = impl_->registers[rn] + rm;
                    else if (sub_op == 3) impl_->registers[rd] = impl_->registers[rn] - rm;
                }
                continue;
            }

            // Move/Compare/Add/Subtract immediate (001xx)
            if ((op & 0xE000) == 0x2000) {
                const unsigned op_type = (op >> 11) & 3;
                const unsigned rd = (op >> 8) & 7;
                const std::uint32_t imm8 = op & 0xFF;

                if (op_type == 0) impl_->registers[rd] = imm8;
                else if (op_type == 2) impl_->registers[rd] += imm8;
                else if (op_type == 3) impl_->registers[rd] -= imm8;
                continue;
            }

            // ALU operations (010000)
            if ((op & 0xFC00) == 0x4000) {
                const unsigned alu = (op >> 6) & 0xF;
                const unsigned rm = (op >> 3) & 7;
                const unsigned rd = op & 7;

                if (alu == 0) impl_->registers[rd] &= impl_->registers[rm];
                else if (alu == 1) impl_->registers[rd] ^= impl_->registers[rm];
                else if (alu == 2) impl_->registers[rd] <<= (impl_->registers[rm] & 0x1F);
                else if (alu == 3) impl_->registers[rd] >>= (impl_->registers[rm] & 0x1F);
                else if (alu == 4) impl_->registers[rd] = static_cast<std::uint32_t>(static_cast<std::int32_t>(impl_->registers[rd]) >> (impl_->registers[rm] & 0x1F));
                else if (alu == 5) impl_->registers[rd] += impl_->registers[rm];
                else if (alu == 6) impl_->registers[rd] -= impl_->registers[rm];
                else if (alu == 7) {
                    unsigned r = impl_->registers[rm] & 31;
                    impl_->registers[rd] = r ? ((impl_->registers[rd] >> r) | (impl_->registers[rd] << (32 - r))) : impl_->registers[rd];
                }
                else if (alu == 9) impl_->registers[rd] = 0 - impl_->registers[rm];
                else if (alu == 12) impl_->registers[rd] |= impl_->registers[rm];
                else if (alu == 13) impl_->registers[rd] *= impl_->registers[rm];
                else if (alu == 14) impl_->registers[rd] &= ~impl_->registers[rm];
                else if (alu == 15) impl_->registers[rd] = ~impl_->registers[rm];
                continue;
            }

            // High reg operations, BX, BLX (010001)
            if ((op & 0xFC00) == 0x4400) {
                const unsigned op_type = (op >> 8) & 3;
                const unsigned d = ((op >> 4) & 8) | (op & 7);
                const unsigned rm = (op >> 3) & 0xF;

                if (op_type == 0) {
                    impl_->registers[d] += impl_->registers[rm];
                    continue;
                }
                if (op_type == 2) {
                    impl_->registers[d] = impl_->registers[rm];
                    continue;
                }
                if (op_type == 3) {
                    const bool link = (op & 0x0080) != 0;
                    const std::uint32_t target = impl_->registers[rm];
                    if (link) {
                        impl_->registers[14] = impl_->registers[15] | 1u;
                    }
                    if (target == 0xFFFFFFFEu || target == 0) {
                        impl_->returned_from_call = true;
                        return true;
                    }
                    thumb = (target & 1) != 0;
                    impl_->registers[15] = target & ~1u;
                    continue;
                }
            }

            // LDR Rd, [PC, #imm8*4] (01001)
            if ((op & 0xF800) == 0x4800) {
                const unsigned rd = (op >> 8) & 7;
                const std::uint32_t addr = ((pc + 2) & ~3u) + ((op & 0xFF) * 4);
                if (impl_->memory->contains(addr, 4)) {
                    std::memcpy(&impl_->registers[rd], impl_->memory->data(addr), 4);
                }
                continue;
            }

            // LDR / STR with register offset (0101xx)
            if ((op & 0xF200) == 0x5000) {
                const unsigned rd = op & 7;
                const unsigned rn = (op >> 3) & 7;
                const unsigned rm = (op >> 6) & 7;
                const std::uint32_t addr = impl_->registers[rn] + impl_->registers[rm];
                if (op & 0x0800) {
                    if (impl_->memory->contains(addr, 4)) std::memcpy(&impl_->registers[rd], impl_->memory->data(addr), 4);
                } else {
                    impl_->memory->write(addr, &impl_->registers[rd], 4);
                }
                continue;
            }

            // LDR / STR with imm5*4 offset (011xx)
            if ((op & 0xE000) == 0x6000) {
                const bool is_load = (op & 0x0800) != 0;
                const bool is_byte = (op & 0x1000) != 0;
                const unsigned imm5 = (op >> 6) & 0x1F;
                const unsigned rn = (op >> 3) & 7;
                const unsigned rd = op & 7;
                const std::uint32_t addr = impl_->registers[rn] + (is_byte ? imm5 : (imm5 * 4));

                if (is_load) {
                    if (is_byte) {
                        impl_->registers[rd] = impl_->memory->contains(addr, 1) ? *impl_->memory->data(addr) : 0;
                    } else {
                        if (impl_->memory->contains(addr, 4)) std::memcpy(&impl_->registers[rd], impl_->memory->data(addr), 4);
                    }
                } else {
                    if (is_byte) {
                        std::uint8_t b = impl_->registers[rd] & 0xFF;
                        impl_->memory->write(addr, &b, 1);
                    } else {
                        impl_->memory->write(addr, &impl_->registers[rd], 4);
                    }
                }
                continue;
            }

            // LDR / STR SP, #imm8*4 (1001)
            if ((op & 0xF000) == 0x9000) {
                const bool is_load = (op & 0x0800) != 0;
                const unsigned rd = (op >> 8) & 7;
                const std::uint32_t addr = impl_->registers[13] + ((op & 0xFF) * 4);
                if (is_load) {
                    if (impl_->memory->contains(addr, 4)) std::memcpy(&impl_->registers[rd], impl_->memory->data(addr), 4);
                } else {
                    impl_->memory->write(addr, &impl_->registers[rd], 4);
                }
                continue;
            }

            // ADD Rd, PC/SP, #imm8*4 (1010)
            if ((op & 0xF000) == 0xA000) {
                const bool from_sp = (op & 0x0800) != 0;
                const unsigned rd = (op >> 8) & 7;
                const std::uint32_t base = from_sp ? impl_->registers[13] : ((pc + 2) & ~3u);
                impl_->registers[rd] = base + ((op & 0xFF) * 4);
                continue;
            }

            // Misc instructions (1011)
            if ((op & 0xF000) == 0xB000) {
                if ((op & 0xFF00) == 0xB000) {
                    const std::uint32_t off = (op & 0x7F) * 4;
                    if (op & 0x80) impl_->registers[13] -= off;
                    else impl_->registers[13] += off;
                    continue;
                }
                if ((op & 0xFE00) == 0xB400) { // PUSH
                    const bool push_lr = (op & 0x0100) != 0;
                    if (push_lr) {
                        impl_->registers[13] -= 4;
                        impl_->memory->write(impl_->registers[13], &impl_->registers[14], 4);
                    }
                    for (int r = 7; r >= 0; --r) {
                        if (op & (1 << r)) {
                            impl_->registers[13] -= 4;
                            impl_->memory->write(impl_->registers[13], &impl_->registers[r], 4);
                        }
                    }
                    continue;
                }
                if ((op & 0xFE00) == 0xBC00) { // POP
                    const bool pop_pc = (op & 0x0100) != 0;
                    for (int r = 0; r <= 7; ++r) {
                        if (op & (1 << r)) {
                            if (impl_->memory->contains(impl_->registers[13], 4)) {
                                std::memcpy(&impl_->registers[r], impl_->memory->data(impl_->registers[13]), 4);
                            }
                            impl_->registers[13] += 4;
                        }
                    }
                    if (pop_pc) {
                        std::uint32_t target = 0;
                        if (impl_->memory->contains(impl_->registers[13], 4)) {
                            std::memcpy(&target, impl_->memory->data(impl_->registers[13]), 4);
                        }
                        impl_->registers[13] += 4;
                        if (target == 0xFFFFFFFEu || target == 0) {
                            impl_->returned_from_call = true;
                            return true;
                        }
                        thumb = (target & 1) != 0;
                        impl_->registers[15] = target & ~1u;
                    }
                    continue;
                }
                if (op == 0xBF00) continue; // NOP
            }

            // SVC / Conditional branch (1101)
            if ((op & 0xF000) == 0xD000) {
                if ((op & 0xFF00) == 0xDF00) {
                    const std::uint8_t imm8 = op & 0xFF;
                    if (imm8 == 0xFE) {
                        impl_->returned_from_call = true;
                        return true;
                    }
                    if (impl_->svc_handler) {
                        impl_->svc_handler(imm8, *this);
                    }
                    continue;
                }
                const std::int8_t offset = static_cast<std::int8_t>(op & 0xFF);
                impl_->registers[15] = pc + 2 + (offset * 2);
                continue;
            }

            // Unconditional branch (11100)
            if ((op & 0xF800) == 0xE000) {
                const std::int16_t raw = static_cast<std::int16_t>((op & 0x7FF) << 5) >> 4;
                if (raw == -4) { // infinite loop B . -> finish cleanly
                    return true;
                }
                impl_->registers[15] = pc + 2 + raw;
                continue;
            }

            // 32-bit Thumb BL (11110)
            if ((op & 0xF800) == 0xF000) {
                std::uint16_t op2 = 0;
                if (impl_->memory->contains(impl_->registers[15], 2)) {
                    std::memcpy(&op2, impl_->memory->data(impl_->registers[15]), 2);
                }
                impl_->registers[15] += 2;
                const std::int32_t s = (op >> 10) & 1;
                const std::int32_t j1 = (op2 >> 13) & 1;
                const std::int32_t j2 = (op2 >> 11) & 1;
                const std::int32_t i1 = !(j1 ^ s);
                const std::int32_t i2 = !(j2 ^ s);
                const std::int32_t imm10 = op & 0x3FF;
                const std::int32_t imm11 = op2 & 0x7FF;
                const std::int32_t offset = (s ? 0xFF000000 : 0) | (i1 << 23) | (i2 << 22) | (imm10 << 12) | (imm11 << 1);
                impl_->registers[14] = impl_->registers[15] | 1u;
                impl_->registers[15] = (pc + 2) + offset;
                continue;
            }

            impl_->returned_from_call = true;
            return true;
        } else {
            // ARM 32-bit mode
            if (!impl_->memory->contains(pc, sizeof(std::uint32_t))) {
                impl_->faulted = true;
                return false;
            }

            std::uint32_t op = 0;
            std::memcpy(&op, impl_->memory->data(pc), sizeof(op));
            impl_->registers[15] += 4;

            // MOVW Rd, #imm16
            if ((op & 0x0FF00000) == 0x03000000) {
                const std::uint32_t imm16 = ((op >> 4) & 0xF000u) | (op & 0x0FFFu);
                const unsigned rd = (op >> 12) & 0xF;
                impl_->registers[rd] = imm16;
                continue;
            }

            // MOVT Rd, #imm16
            if ((op & 0x0FF00000) == 0x03400000) {
                const std::uint32_t imm16 = ((op >> 4) & 0xF000u) | (op & 0x0FFFu);
                const unsigned rd = (op >> 12) & 0xF;
                impl_->registers[rd] = (impl_->registers[rd] & 0xFFFFu) | (imm16 << 16);
                continue;
            }

            // Data processing immediate
            if ((op & 0x0E000000) == 0x02000000) {
                const unsigned alu = (op >> 21) & 0xF;
                const unsigned rd = (op >> 12) & 0xF;
                const unsigned rn = (op >> 16) & 0xF;
                std::uint32_t imm = op & 0xFF;
                const unsigned rot = (op >> 8) & 0xF;
                if (rot) imm = (imm >> (rot * 2)) | (imm << (32 - rot * 2));

                if (alu == 13) impl_->registers[rd] = imm; // MOV
                else if (alu == 4) impl_->registers[rd] = impl_->registers[rn] + imm; // ADD
                else if (alu == 2) impl_->registers[rd] = impl_->registers[rn] - imm; // SUB
                else if (alu == 0) impl_->registers[rd] = impl_->registers[rn] & imm; // AND
                else if (alu == 12) impl_->registers[rd] = impl_->registers[rn] | imm; // ORR
                continue;
            }

            // BX / BLX Rm must be decoded before generic data-processing
            // instructions: its encoding otherwise matches that broader class.
            if ((op & 0x0FFFFFF0) == 0x012FFF10 || (op & 0x0FFFFFF0) == 0x012FFF30) {
                const bool link = (op & 0x20) != 0;
                const unsigned rm = op & 0xF;
                const std::uint32_t target = impl_->registers[rm];
                if (link) impl_->registers[14] = pc + 4;
                if (target == 0xFFFFFFFEu || target == 0) {
                    impl_->returned_from_call = true;
                    return true;
                }
                thumb = (target & 1) != 0;
                impl_->registers[15] = target & ~1u;
                continue;
            }

            // Data processing register; explicitly exclude BX/BLX so branch
            // exchange can never be swallowed by this generic decoder.
            if ((op & 0x0E000000) == 0x00000000 &&
                (op & 0x0FFFFFF0) != 0x012FFF10 &&
                (op & 0x0FFFFFF0) != 0x012FFF30) {
                const unsigned alu = (op >> 21) & 0xF;
                const unsigned rd = (op >> 12) & 0xF;
                const unsigned rn = (op >> 16) & 0xF;
                const unsigned rm = op & 0xF;

                if (alu == 13) impl_->registers[rd] = impl_->registers[rm]; // MOV
                else if (alu == 4) impl_->registers[rd] = impl_->registers[rn] + impl_->registers[rm]; // ADD
                else if (alu == 2) impl_->registers[rd] = impl_->registers[rn] - impl_->registers[rm]; // SUB
                continue;
            }

            // SVC #imm24
            if ((op & 0x0F000000) == 0x0F000000) {
                const std::uint32_t imm = op & 0x00FFFFFFu;
                if (imm == 0xFE) {
                    impl_->returned_from_call = true;
                    return true;
                }
                if (impl_->svc_handler) {
                    impl_->svc_handler(imm, *this);
                }
                continue;
            }

            // LDR / STR immediate offset
            if ((op & 0x0C000000) == 0x04000000) {
                const bool is_load = (op & 0x00100000) != 0;
                const bool is_up = (op & 0x00800000) != 0;
                const unsigned rn = (op >> 16) & 0xF;
                const unsigned rd = (op >> 12) & 0xF;
                const std::uint32_t offset = op & 0xFFF;
                const std::uint32_t addr = is_up ? (impl_->registers[rn] + offset) : (impl_->registers[rn] - offset);

                if (is_load) {
                    if (impl_->memory->contains(addr, 4)) std::memcpy(&impl_->registers[rd], impl_->memory->data(addr), 4);
                } else {
                    impl_->memory->write(addr, &impl_->registers[rd], 4);
                }
                continue;
            }

            // B / BL branch
            if ((op & 0x0E000000) == 0x0A000000) {
                const bool link = (op & 0x01000000) != 0;
                const std::int32_t offset = static_cast<std::int32_t>(op << 8) >> 6;
                if (link) impl_->registers[14] = pc + 4;
                if (offset == -8) { // infinite loop B . -> finish
                    return true;
                }
                impl_->registers[15] = pc + 8 + offset;
                continue;
            }

            impl_->returned_from_call = true;
            return true;
        }
    }

    return true;
}

bool GuestCpu::call(
    std::uint32_t entry,
    bool thumb,
    std::span<const std::uint32_t> arguments
) {
    if (!impl_ || !impl_->memory) {
        return false;
    }

    for (std::size_t i = 0; i < arguments.size() && i < 4; ++i) {
        impl_->registers[i] = arguments[i];
    }

    impl_->registers[14] = 0xFFFFFFFEu;
    return run(entry, thumb, 100000);
}

void GuestCpu::set_svc_handler(SvcHandler handler) {
    if (impl_) {
        impl_->svc_handler = std::move(handler);
    }
}

std::uint32_t GuestCpu::register_value(std::size_t index) const {
    return (impl_ && index < 16) ? impl_->registers[index] : 0;
}

void GuestCpu::set_register(std::size_t index, std::uint32_t value) {
    if (impl_ && index < 16) {
        impl_->registers[index] = value;
    }
}

std::uint32_t GuestCpu::program_counter() const {
    return register_value(15);
}

bool GuestCpu::faulted() const {
    return impl_ ? impl_->faulted : false;
}

bool GuestCpu::returned_from_call() const {
    return impl_ ? impl_->returned_from_call : false;
}

void GuestCpu::clear_fault() {
    if (impl_) {
        impl_->faulted = false;
        impl_->returned_from_call = false;
    }
}

} // namespace mc3::arm

#endif
