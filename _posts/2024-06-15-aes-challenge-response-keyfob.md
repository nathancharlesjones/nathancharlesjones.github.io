---
layout: post
title: "AES-Based Challenge-Response Authentication for Key Fob Systems"
date: 2024-06-15
type: article
subjects:
  - firmware
  - security
excerpt: >
  A walkthrough of implementing AES-based challenge-response authentication
  on a resource-constrained microcontroller, with fault-resistant design to
  withstand voltage glitching attacks.
documents:
  - title: "Reference Implementation (ZIP)"
    url: /assets/docs/aes-keyfob-reference.zip
    type: zip
  - title: "Architecture Notes (PDF)"
    url: /assets/docs/aes-keyfob-arch.pdf
    type: pdf
---

Embedded security is often treated as an afterthought—a thin veneer of
protection bolted onto an otherwise-complete design. This post takes the
opposite approach: we start from an attacker's perspective and build a key fob
authentication system that remains correct under adversarial conditions,
including physical attacks like voltage glitching.

## The Threat Model

Before writing a single line of code, we need to understand what we're
defending against. For a key fob system, the relevant threat categories are:

- **Replay attacks** — capturing a valid authentication token and retransmitting it
- **Brute-force attacks** — exhaustively trying possible secrets
- **Physical fault injection** — using voltage glitches to skip security checks

A naive `if (key == secret) unlock();` pattern is vulnerable to all three.

## Challenge-Response Authentication

The standard mitigation for replay attacks is to require the authenticator to
prove knowledge of a secret *in response to a fresh challenge*, rather than
presenting a static token.

```c
// Pseudocode — see reference implementation for full details
void authenticate(void) {
    uint8_t challenge[16];
    uint8_t response[16];
    uint8_t expected[16];

    generate_random(challenge, 16);
    transmit(challenge, 16);
    receive(response, 16);

    aes_encrypt(challenge, SECRET_KEY, expected);

    if (constant_time_compare(response, expected, 16)) {
        unlock();
    }
}
```

The key details:

1. **`generate_random`** must produce cryptographically unpredictable values — not
   a simple `rand()` seeded from uptime.
2. **`constant_time_compare`** prevents timing side-channels that could leak
   information about where a comparison fails.
3. The secret key lives in protected flash, never transmitted.

## Fault-Resistant Design

Voltage glitching can cause individual instructions to be skipped or corrupted.
A common attack pattern against authentication code is to glitch past the
comparison, causing the branch to always succeed.

The mitigation is redundancy and inversion checks:

```c
// Fault-resistant comparison pattern
bool secure_compare(const uint8_t *a, const uint8_t *b, size_t n) {
    volatile uint8_t diff     = 0;
    volatile uint8_t inv_diff = 0xFF;

    for (size_t i = 0; i < n; i++) {
        diff     |= (a[i] ^ b[i]);
        inv_diff &= ~(a[i] ^ b[i]);
    }

    // Both must agree — a glitch that clears diff won't also set inv_diff
    return (diff == 0) && (inv_diff == 0xFF);
}
```

## What This Doesn't Cover

This post focuses on the authentication handshake. A production system also
needs secure key provisioning, secure boot, and a well-thought-out key
hierarchy. Those are topics for future articles.

See the attached reference implementation for a complete, buildable example
targeting the STM32F4.
