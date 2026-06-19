---
layout: post
title: "Getting Started with FPGA Design: A Practical Introduction"
date: 2023-11-01
type: talk
subjects:
  - fpga
  - education
  - digital-design
excerpt: >
  Slides and notes from an introductory talk on FPGA development — covering
  why FPGAs matter, how to think about RTL design, and a hands-on demo
  building a simple UART in VHDL.
documents:
  - title: "Slides (PDF)"
    url: /assets/docs/fpga-intro-slides.pdf
    type: pdf
---

*These are the notes from a talk given at [your venue here] in November 2023.*

FPGAs have a reputation for being difficult to learn. Some of that reputation
is deserved — the tooling can be rough, and "thinking in hardware" is a genuine
mental shift. But the fundamentals are more approachable than they appear.

## Why FPGAs?

The short version: FPGAs let you implement custom digital hardware without
committing to a fabrication run. You describe logic, synthesize it, and deploy
to a chip that reconfigures itself to match your description.

The use cases in embedded systems are mostly about performance and
parallelism — things a microcontroller processes sequentially, an FPGA can
handle in parallel, with deterministic timing.

## RTL Thinking

The key mental model shift is this: you're not writing instructions that
execute one at a time. You're describing *circuits* — logic that exists
simultaneously and reacts to signals.

A simple example in VHDL:

```vhdl
-- A D flip-flop with synchronous reset
process(clk)
begin
    if rising_edge(clk) then
        if reset = '1' then
            q <= '0';
        else
            q <= d;
        end if;
    end if;
end process;
```

The `process` block here describes what happens on every clock edge. It doesn't
"run" — it *reacts*.

## The Demo: A Simple UART TX

The talk included a live demo building a UART transmitter from scratch:
baud rate generator → shift register → start/stop bit insertion → output pin.

See the attached slides for the full walkthrough with timing diagrams.

## Resources for Going Deeper

- *Digital Design and Computer Architecture* (Harris & Harris) — best textbook
  in the field, covers both VHDL and SystemVerilog
- [nandland.com](https://nandland.com) — practical FPGA tutorials
- Lattice iCEstick — good low-cost dev board for getting started
