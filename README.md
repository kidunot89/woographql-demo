# WooGraphQL Shop Demo

This repository holds the code used for the "Building Headless Shops With WooGraphQL" tutorials created by [Geoff Taylor](https://twitter.com/kidunot89).

It consists of two parts:
- `/backend`: A WordPress installation managed by [PHP Composer]() and configured using [Bedrock]() by [Roots.io](). Contains all the plugins and Docker configures for local usage. It's purpose is to be the WP Backend for readers run the demo application in `/frontend` or coding alongside the tutorial series.
- `/frontend`: The demo e-commerce application built using Next.js. The demonstration and reference purposes only. Styling has been keep to a minimal and `shadcn/ui` has been utilized to add a few simple components to the application. The application contains 3 pages.
