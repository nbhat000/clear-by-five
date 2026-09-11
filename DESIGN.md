---
name: Clear by Five
description: A printed job estimate for the visitor's own business.
colors:
  paper: "#fbfcfb"
  ink: "#0b5d45"
  ink-deep: "#084a37"
  ink-soft: "#d0eadf"
  rule-soft: "#bcd3c9"
  fill: "#eef5f1"
  carbon: "#1a1a1a"
  carbon-2: "#4a4f4d"
  canary: "#f8dc5a"
  canary-text: "#4a400e"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3rem, 6.2vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  heading:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.25rem)"
    fontWeight: 750
    lineHeight: 1.04
    letterSpacing: "-0.028em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  form-label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  box: "2px"
  control: "3px"
spacing:
  1: "8px"
  2: "16px"
  3: "24px"
  4: "40px"
  5: "64px"
  6: "clamp(72px, 9vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.ink-deep}"
  button-canary:
    backgroundColor: "{colors.canary}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.control}"
  blank-input:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.box}"
    padding: "1px 6px 0"
---

## Overview

The site is a job estimate, the document home-service owners write every day. Pre-printed structure (labels, rules, column heads, total rules, checkboxes) is printed in one green spot ink. Everything filled in (headlines, entries, amounts) is carbon black. The hero worksheet is a real fill-in form that totals the visitor's own numbers.

## Colors

White bond paper with green ink is the default surface. Canary (the carbon-copy yellow) owns exactly one full-width region: the audit terms. Solid green owns the closing section, topped by a dashed perforation. Secondary text on canary uses `canary-text`, on green uses `ink-soft`; never neutral gray on a colored field.

## Typography

One family, Archivo, varied by width. Expanded (font-stretch 125%) for display, totals, prices, and the wordmark. Standard width for body. Condensed (80%) for printed form labels and column heads. Tabular figures anywhere numbers line up. Sentence case everywhere; no tracked uppercase labels, no eyebrows above headings.

## Layout

12-column logic expressed as 7/5 and 5/7 splits, left aligned. Sections are separated by ink rules rather than cards. Line items (worksheet rows, symptoms, steps) are ruled rows, not boxes.

## Elevation & Depth

Flat. No shadows. Depth comes from ink weight: 2px ink rules for form edges, 1px ink for row groups, `rule-soft` for rows within a group, a double carbon rule under totals.

## Shapes

Square form boxes (2px radius) for inputs, checkboxes, and step numbers. Controls take 3px. Nothing rounder.

## Components

Fill-in blanks sit inline in sentences with a fill tint and an ink underline. Checkboxes are drawn boxes with a CSS check. Ledger rows (label left, value right) carry terms and prices. The founder photo is the only raster: 4:5, 2px radius, unfiltered, with its green studio backdrop echoing the ink; the signature block bottom-aligns to it. Motion is limited to the total's double rule drawing in once, a canary tally flash on changed amounts, and the checkbox tick.

## Do's and Don'ts

Do show arithmetic with the visitor's own inputs, labeled as examples. Do keep printed structure green and entries black. Don't add cards, shadows, gradients, icon tiles, or scroll-reveal animations. Don't invent client names, results, or testimonials. Don't use a second accent color.
