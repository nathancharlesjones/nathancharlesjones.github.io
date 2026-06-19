---
layout: post
title: "HAL Design Patterns for Portable Embedded C"
date: 2024-02-10
type: tutorial
subjects:
  - firmware
  - architecture
  - education
excerpt: >
  How to structure a Hardware Abstraction Layer so that application code
  doesn't care which microcontroller it's running on — and how to use
  dependency injection to make that code testable on a host machine.
---

One of the hardest things to teach in embedded systems is *portability*. Not
because the concept is difficult, but because almost every example you find in
the wild is deeply coupled to a specific chip family.

This tutorial walks through a HAL design I've refined over several years of
teaching and consulting work. The goal: application logic that compiles and
runs identically on an STM32, a TM4C, or a native host for unit testing.

## The Core Idea: Program to Interfaces

In C, we don't have classes, but we have function pointers and structs. A HAL
can be expressed as a struct of function pointers:

```c
// hal/uart.h
typedef struct {
    void     (*init)(uint32_t baud_rate);
    void     (*send_byte)(uint8_t byte);
    int      (*recv_byte)(uint8_t *out, uint32_t timeout_ms);
    bool     (*tx_ready)(void);
} uart_hal_t;
```

Application code takes a `const uart_hal_t *` and calls through the
interface. It has no idea whether the underlying implementation uses STM32
HAL, bare-register access, or a ring buffer backed by a POSIX pipe.

## Platform Implementations

For each target, you provide a concrete implementation:

```c
// platform/stm32/uart_stm32.c
static void stm32_uart_init(uint32_t baud_rate) {
    // ... STM32 HAL calls ...
}

const uart_hal_t uart_stm32 = {
    .init      = stm32_uart_init,
    .send_byte = stm32_uart_send_byte,
    .recv_byte = stm32_uart_recv_byte,
    .tx_ready  = stm32_uart_tx_ready,
};
```

## Host Testing

For the host, you implement the same interface using standard C:

```c
// platform/host/uart_host.c
static void host_uart_init(uint32_t baud_rate) {
    // No-op on host, or open a pty/socket
    (void)baud_rate;
}
// ...
```

Now your application's unit tests can run with `gcc` on your development
machine, with no hardware required.

## Wiring It Together

At startup (main.c for each target), pass the right implementation:

```c
// main_stm32.c
int main(void) {
    app_init(&uart_stm32);
    while (1) { app_run(); }
}
```

```c
// test_app.c
int main(void) {
    app_init(&uart_host);
    // run tests ...
}
```

## Takeaways

- Function-pointer structs give you interface-based design in C
- Keep platform-specific code behind the interface boundary
- Build and test application logic on the host first — it's much faster

This pattern scales well to GPIO, SPI, I2C, timers, and any other peripheral.
Once you've written a few HAL implementations, the pattern becomes second
nature.
