---
title: "AnuPpuccin Obsidian Soft Paper Theme"
source: "https://www.reddit.com/r/ObsidianMD/comments/1h9rpw6/anuppuccin_obsidian_soft_paper_theme/"
author:
  - "[[emarpiee]]"
published: 2024-12-08
created: 2026-08-20
description: "It turns out a lot of you liked the theme and customization I used in my previous post. If you want to try this in your vault, here's quick"
tags:
  - "clippings"
---
It turns out a lot of you liked the theme and customization I used in my [previous post](https://www.reddit.com/r/ObsidianMD/comments/1h8x8xn/1_year_in_obsidian/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button). If you want to try this in your vault, here's quick and easy setup for you.

Before diving in, it's important to note that this configuration is heavily inspired by [u/SamBorgman](https://www.reddit.com/user/SamBorgman/)'s [AnuPpuccin setup](https://www.reddit.com/r/ObsidianMD/comments/12kfo7j/comment/jg2dj1j/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) and [Nick Milos' Soft Paper Theme](https://www.youtube.com/watch?v=lUZjpIhYOEw&t). You should definitely check out their work for more ideas.

This theme is customized to match my personal aesthetic preferences. I won’t provide an in-depth, step-by-step guide on how each of AnuPpuccin's settings works.

Here's a downloadable [sample vault](https://drive.google.com/file/d/1IOIyAEgKTGRAkEtxEj7WITO-NXyJeUcJ/view?usp=drive_link) if you want to preview the theme before setting it up in your own vault.

![r/ObsidianMD - Samples](https://preview.redd.it/anuppuccin-obsidian-soft-paper-theme-v0-ipy7tvjxmo5e1.png?width=1080&crop=smart&auto=webp&s=e007981835e1e1a1487d24e1773287ca00df7a96)

Samples

![r/ObsidianMD - Theme in Action](https://preview.redd.it/anuppuccin-obsidian-soft-paper-theme-v0-x0hx1cq3no5e1.png?width=1080&crop=smart&auto=webp&s=dd2df52017353bd66dd436bc95c1ba8983b65747)

Theme in Action

# \## Quick Setup

1. Start by installing and enabling the Style Settings plugin from Obsidian's community plugins.
2. Then, install the AnuPpuccin theme in Obsidian and select it as your theme.
3. Next, navigate to Obsidian's Settings and find Style Settings. Click import (top-right corner) and paste this [configuration](https://drive.google.com/file/d/1_bh-QAQqOegqQc286Q1N96nwFplCFYbM/view?usp=drive_link) (include curly brackets), then hit save.
### configuration script

{
  "anuppuccin-theme-settings@@anuppuccin-theme-light": "ctp-rosepine-light",
  "anuppuccin-theme-settings@@anuppuccin-theme-dark": "ctp-mocha-old",
  "anuppuccin-theme-settings@@anuppuccin-light-theme-accents": "ctp-accent-light-lavender",
  "anuppuccin-theme-settings@@anuppuccin-theme-accents": "ctp-accent-lavender",
  "anuppuccin-theme-settings@@anuppuccin-accent-toggle": true,
  "anuppuccin-theme-settings@@ctp-custom-teal@@dark": "#11B7C5",
  "anuppuccin-theme-settings@@ctp-custom-overlay0@@dark": "#9F88C9",
  "anuppuccin-theme-settings@@anp-active-line": "anp-current-line-border-only",
  "anuppuccin-theme-settings@@anp-callout-select": "anp-callout-sleek",
  "anuppuccin-theme-settings@@anp-callout-color-toggle": true,
  "anuppuccin-theme-settings@@anp-custom-checkboxes": true,
  "anuppuccin-theme-settings@@anp-speech-bubble": true,
  "anuppuccin-theme-settings@@tag-radius": 2,
  "anuppuccin-theme-settings@@anp-color-transition-toggle": true,
  "anuppuccin-theme-settings@@anp-cursor": "pointer",
  "anuppuccin-theme-settings@@anp-toggle-scrollbars": false,
  "anuppuccin-theme-settings@@anp-editor-font-source": "\"\"",
  "anuppuccin-theme-settings@@anp-editor-font-lp": "\"\"",
  "anuppuccin-theme-settings@@anp-font-live-preview-wt": "300",
  "anuppuccin-theme-settings@@anp-header-color-toggle": true,
  "anuppuccin-theme-settings@@anp-header-divider-color-toggle": true,
  "anuppuccin-theme-settings@@h1-weight": 700,
  "anuppuccin-theme-settings@@h2-weight": 700,
  "anuppuccin-theme-settings@@h3-weight": 700,
  "anuppuccin-theme-settings@@h4-weight": 700,
  "anuppuccin-theme-settings@@h5-weight": 700,
  "anuppuccin-theme-settings@@h6-size": 1.1,
  "anuppuccin-theme-settings@@h6-weight": 700,
  "anuppuccin-theme-settings@@anp-decoration-toggle": true,
  "anuppuccin-theme-settings@@anp-colorful-frame": true,
  "anuppuccin-theme-settings@@anp-collapse-folders": true,
  "anuppuccin-theme-settings@@anp-file-icons": true,
  "anuppuccin-theme-settings@@anp-file-label-align": "0",
  "anuppuccin-theme-settings@@anp-alt-rainbow-style": "anp-full-rainbow-color-toggle",
  "anuppuccin-theme-settings@@anp-simple-rainbow-title-toggle": true,
  "anuppuccin-theme-settings@@anp-simple-rainbow-indentation-toggle": true,
  "anuppuccin-theme-settings@@anp-safari-tab-animated": false,
  "anuppuccin-theme-settings@@anp-layout-select": "anp-border-layout",
  "anuppuccin-theme-settings-extended@@anp-theme-ext-light": false,
  "anuppuccin-theme-settings-extended@@anp-theme-ext-dark": true,
  "anuppuccin-theme-settings-extended@@anp-theme-ext-amoled": true,
  "anuppuccin-theme-settings-extended@@catppuccin-theme-dark-extended": "ctp-amoled-dark",
  "anuppuccin-theme-settings@@ctp-custom-surface2@@dark": "#9F88C9",
  "anuppuccin-theme-settings@@anp-hide-borders": false,
  "anuppuccin-theme-settings@@anp-bg-fix": true,
  "anuppuccin-theme-settings@@anp-table-toggle": true,
  "anuppuccin-theme-settings@@anp-table-width": true,
  "anuppuccin-theme-settings@@anp-table-th-highlight": true,
  "anuppuccin-theme-settings@@anp-table-highlight-opacity": 1,
  "anuppuccin-theme-settings@@anp-td-highlight": "anp-table-row-alt",
  "anuppuccin-theme-settings@@anp-print": false,
  "anuppuccin-theme-settings@@anp-colorful-frame-icon-toggle-light": false,
  "anuppuccin-theme-settings@@anp-colorful-frame-icon-toggle-dark": false,
  "anuppuccin-theme-settings@@cards-border-width": "2px",
  "anuppuccin-theme-settings@@anp-table-auto": true,
  "anuppuccin-theme-settings@@anp-table-align-td": "left",
  "anuppuccin-theme-settings@@anp-codeblock-numbers": true,
  "anuppuccin-theme-settings@@anp-button-metadata-toggle": false,
  "anuppuccin-theme-settings@@anp-toggle-metadata": false,
  "anuppuccin-theme-settings@@anp-list-toggle": true,
  "anuppuccin-theme-settings@@ctp-custom-mauve@@light": "#262626",
  "anuppuccin-theme-settings@@ctp-custom-mauve@@dark": "#DBDBDB",
  "anuppuccin-theme-settings@@anp-status-bar-select": "anp-fixed-status-bar",
  "anuppuccin-theme-settings@@ctp-custom-lavender@@light": "#453866",
  "anuppuccin-theme-settings@@ctp-custom-lavender@@dark": "#9F88C9",
  "anuppuccin-theme-settings@@ctp-custom-text@@dark": "#DBDBDB",
  "anuppuccin-theme-settings@@ctp-custom-overlay2@@dark": "#9F88C9",
  "anuppuccin-theme-settings@@anp-custom-vault-toggle": false,
  "anuppuccin-theme-settings@@anp-floating-header": false,
  "anuppuccin-theme-settings@@anp-font-preview-wt": "300",
  "anuppuccin-theme-settings@@anp-font-editor-wt": "300",
  "anuppuccin-theme-settings@@bold-weight": "900",
  "anuppuccin-theme-settings@@tag-border-width": 0.5,
  "anuppuccin-theme-settings@@cards-image-height": "200px",
  "anuppuccin-theme-settings@@anp-rainbow-file-toggle": false,
  "anuppuccin-theme-settings@@anp-full-rainbow-text-color-toggle-light": false,
  "anuppuccin-theme-settings@@anp-full-rainbow-text-color-toggle-dark": false,
  "anuppuccin-theme-settings@@anp-table-align-th": "center",
  "anuppuccin-theme-settings@@anp-table-thickness": 2,
  "anuppuccin-theme-settings@@anp-autohide-titlebar": false,
  "anuppuccin-theme-settings@@anp-disable-newtab-align": true,
  "anuppuccin-theme-settings@@cards-padding": "0",
  "anuppuccin-theme-settings@@anp-h3-color-custom": "anp-h3-yellow",
  "anuppuccin-theme-settings@@anp-h4-color-custom": "anp-h4-green",
  "anuppuccin-theme-settings@@anp-h5-color-custom": "anp-h5-sky",
  "anuppuccin-theme-settings@@anp-h6-color-custom": "anp-h6-lavender",
  "anuppuccin-theme-settings@@anp-simple-rainbow-collapse-icon-toggle": false,
  "anuppuccin-theme-settings@@anp-simple-rainbow-icon-toggle": false,
  "anuppuccin-theme-settings@@anp-rainbow-subfolder-color-toggle": false,
  "anuppuccin-theme-settings-extended@@catppuccin-theme-extended": "ctp-notion-light",
  "anuppuccin-theme-settings@@ctp-custom-teal@@light": "#497B6D",
  "anuppuccin-theme-settings@@ctp-custom-sky@@light": "#43667B",
  "anuppuccin-theme-settings@@ctp-custom-sapphire@@light": "#43557A",
  "anuppuccin-theme-settings@@ctp-custom-blue@@light": "#3F6196",
  "anuppuccin-theme-settings@@ctp-custom-red@@light": "#A04F4F",
  "anuppuccin-theme-settings@@ctp-custom-maroon@@light": "#7B2E2E",
  "anuppuccin-theme-settings@@anp-toggle-preview": false,
  "anuppuccin-theme-settings@@anp-card-shadows": false,
  "anuppuccin-theme-settings@@anp-card-layout-actions": false,
  "anuppuccin-theme-settings@@anp-card-layout-filebrowser": true,
  "anuppuccin-theme-settings@@anp-alt-tab-style": "anp-depth-tab-toggle",
  "anuppuccin-theme-settings@@anp-depth-tab-text-invert": false,
  "anuppuccin-theme-settings@@anp-depth-tab-opacity": 0.6,
  "anuppuccin-theme-settings@@ctp-custom-surface1@@light": "#C2BCD0",
  "anuppuccin-theme-settings@@anp-colorful-frame-opacity": 1,
  "anuppuccin-theme-settings@@ctp-custom-text@@light": "#000000",
  "anuppuccin-theme-settings@@ctp-custom-green@@light": "#435931",
  "anuppuccin-theme-settings@@ctp-custom-peach@@light": "#C76F43",
  "anuppuccin-theme-settings@@ctp-custom-yellow@@light": "#A28636",
  "anuppuccin-theme-settings@@callout-title-opacity": 0.1,
  "anuppuccin-theme-settings@@anp-callout-fold-position": "1",
  "anuppuccin-theme-settings@@ctp-custom-subtext0@@light": "#453866",
  "anuppuccin-theme-settings@@ctp-custom-subtext0@@dark": "#9F88C9"
}

`

At this point, the basic setup is complete. You can decide whether you like the customization or tweak the settings in Style Settings to better suit your taste.

# \## Complete Setup

If you want your setup to look exactly like mine, follow these steps:

1. After completing the Quick Setup above, go back to Obsidian Settings > Appearance > and under Interface Font, click Manage. Add Times New Roman as your font. If the font for your editor or live preview hasn’t changed, ensure you remove any font specified in the Text Font settings, just below the Interface Font.
2. Since I use a large monitor, I’ve set my font size to 17px and my zoom level to either 131% or 144%. You might want to adjust these settings according to your own preferences and monitor size.
3. I have customized the font weight of my links to 700. This is done using a CSS snippet. If you are not familiar with Obsidian's Snippet feature, make sure to learn about it first.
4. Add this [snippet](https://github.com/AnubisNekhet/AnuPpuccin/blob/main/snippets/extended-colorschemes.css) in your vault if you want to have black AMOLED dark mode.

Finally, if you wish to manually change the accent color, check out the Color Overrides section in AnuPpuccin's Style Settings. This allows you to further personalize the theme to your liking.

\## Side Notes

The folder system I used in the sample vault and in my personal vault is called [ACCESS](https://www.youtube.com/watch?v=p0zWJ-TLghw) by Nick Milo. I think there is a newer version of this system called ACES, also by Nick Milo.

---

## Comments

> **be-merged** · [2024-12-09](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m15zfo2/) · 3 points
> 
> Thank you for sharing! How did you manage to change the color of the nodes in the graph view?
> 
> > **emarpiee** · [2024-12-09](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m16n3v0/) · 2 points
> > 
> > Thanks! You can change everything in Color Overrides in Style Settings.

> **dropscheme** · [2024-12-09](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m14lcjk/) · 4 points
> 
> Thanks for sharing.

> **Distinct\_Ant1888** · [2025-03-14](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mhny1vn/) · 1 points
> 
> Hi, can you post de configuration again, is unavaible when i click it
> 
> > **emarpiee** · [2025-03-22](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mj647wv/) · 1 points
> > 
> > Sorry for replying late. I checked all the links, and they seem to be working fine for me.
> > 
> > > **ffunct** · [2025-03-28](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mk5kbqi/) · 1 points
> > > 
> > > pastebin is not reliable, its down for 12 hours right now.

> **Typhoonic\_10294** · [2025-06-15](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mxwf40o/) · 1 points
> 
> hey, so how do i use the folder system called ACCESS?
> 
> > **emarpiee** · [2025-06-15](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mxwhz8z/) · 2 points
> > 
> > Nick Milo created a video himself explaining how to use ACCESS, you can watch it on YouTube.
> > 
> > I also found this video [https://youtu.be/WtKeeDYA\_2I](https://youtu.be/WtKeeDYA_2I) really helpful for learning how to properly use a folder system.

> **CluelessProductivity** · [2024-12-09](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m1a0g4j/) · 3 points
> 
> Beautiful! Reminds me of Primary, but primary doesn't like my Mac.

> **ler666** · [2024-12-10](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m1bjdh7/) · 2 points
> 
> Thanks for sharing, I have just overrides my theme with your guides. Appriciated

> **OuiOuiBaguette\_007** · [2024-12-20](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/m2z3vcj/) · 2 points
> 
> Thanks for sharing, I am new to this, can you please also share how you set up that whole dashboard and to do list thing along with the permanent notes status table etc.

> **Zealousideal-Mine337** · [2025-01-31](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/ma9fi1f/) · 2 points
> 
> Would it be possible to recreate the soft-paper in minimal theme instead of the anuppuccin?

> **motion2082** · [2025-02-10](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/mc2zzl0/) · 1 points
> 
> Love the theme, anyone know how I can style my "Dataview: No Results to Show for Table Query" like AnuPpuccin in another theme?

> **MustVsNap** · [2025-09-06](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/ncpahea/) · 1 points
> 
> thank you for the description!!!  
> it looks perfect and motivates to use obsidian more  
> i really love this style of my notes

> **FayAskeladden** · [2026-03-14](https://reddit.com/r/ObsidianMD/comments/1h9rpw6/comment/oado9zv/) · 1 points
> 
> is it possible to make it look the same on iPhone?
> 
> so far I managed to make the colors look the same, changing the theme and adding the code. I think it is only missing the font part now, but I don't manage. If I add a similar one like Georgia it doesn't work so well.