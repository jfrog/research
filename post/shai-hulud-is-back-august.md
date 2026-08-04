---
excerpt: The JFrog security research team identified an ongoing supply-chain campaign on npmjs, starting with keyv & cacheable; attributed to the Shai-Hulud malware family. We're investigating, and the post will be updated with all technical details soon.
title: Shai-Hulud's here - Cacheable and Keyv Packages Compromised
date: "August 4, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/hulud_august.png
type: realTimePost
minutes: '5'
---

The JFrog security research team identified a new version of the Shai-Hulud supply-chain malware. The compromise began by affecting the `cacheable` and `keyv` npm packages. Both packages are widely used caching libraries, and `keyv` is a transitive dependency of many popular tools. If you installed a compromised version, assume your environment is affected. This is an ongoing investigation. We are publishing this short notice now and will update it with full technical analysis, affected versions, and remediation steps shortly.

Note that if you're running npm 12 or newer, `preinstall` lifecycle hooks *will not* execute by default, so the malware will not infect you.

![](/img/RealTimePostImage/post/hulud_august.png)

# Compromised packages

The list will be updated shortly.

| Package | Version |
| ------- | ------- |
| `@servicetitan/anvil2` | `3.9.1`, `3.9.3`, `3.9.2` |
| `@servicetitan/titan-chatbot-ui` | `7.1.5`, `7.1.4`, `7.1.3` |
| `@servicetitan/mpa-components` | `2.5.2`, `2.5.1`, `2.5.3` |
| `editable-contracts` | `0.0.12`, `0.0.14`, `0.0.13` |
| `@servicetitan/suppress-warnings` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/time-zones` | `3.8.2`, `3.8.1`, `3.8.3` |
| `@servicetitan/titan-chatbot-ui-cypress` | `9.0.2`, `9.0.3`, `9.0.1` |
| `@servicetitan/temporal-lite` | `3.4.1`, `3.4.2`, `3.4.3` |
| `@servicetitan/startup` | `38.1.3`, `38.1.1`, `38.1.2` |
| `@servicetitan/web-components` | `38.1.3`, `38.1.1`, `38.1.2` |
| `@servicetitan/notifications` | `41.3.2`, `41.3.3`, `41.3.1` |
| `@servicetitan/marketing-ui` | `9.3.1`, `9.3.2`, `9.3.3` |
| `@servicetitan/standalone-root` | `1.11.5`, `1.11.3`, `1.11.4` |
| `@servicetitan/microfront-utils` | `1.4.2`, `1.4.3`, `1.4.1` |
| `@servicetitan/mfe-quick-actions` | `0.5.49`, `0.5.50`, `0.5.51` |
| `@servicetitan/intl` | `7.2.1`, `7.2.3`, `7.2.2` |
| `@servicetitan/marketing-route` | `1.2.2`, `1.2.3`, `1.2.1` |
| `@servicetitan/cp-mfe` | `1.115.3`, `1.115.2`, `1.115.1` |
| `@servicetitan/eslint-plugin-mobx-6` | `12.8.15`, `12.8.16` |
| `@servicetitan/anvil2-illustrations` | `1.0.2`, `1.0.4`, `1.0.3` |
| `@servicetitan/microfront` | `0.0.4`, `0.0.2`, `0.0.3` |
| `@servicetitan/marketing-widgets` | `1.0.2`, `1.0.3`, `1.0.1` |
| `@servicetitan/component-usage` | `28.5.1`, `28.5.3`, `28.5.2` |
| `@servicetitan/link-item` | `41.3.1`, `41.3.3`, `41.3.2` |
| `@servicetitan/skeleton` | `9.2.4`, `9.2.6`, `9.2.5` |
| `@servicetitan/quick-actions` | `1.15.4`, `1.15.3`, `1.15.2` |
| `@servicetitan/culture` | `41.3.3`, `41.3.2`, `41.3.1` |
| `@servicetitan/docs-uikit` | `38.1.3`, `38.1.2`, `38.1.1` |
| `@servicetitan/titan-chat-ui-cypress` | `2.1.5`, `2.1.3`, `2.1.4` |
| `@servicetitan/launchdarkly-service` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/startup-mfe-compat` | `0.5.1`, `0.5.3`, `0.5.2` |
| `@servicetitan/hammer-token` | `3.1.3`, `3.1.2`, `3.1.1` |
| `@servicetitan/ko-bridge` | `38.1.2`, `38.1.3`, `38.1.1` |
| `@servicetitan/onboarding-ui` | `18.5.1`, `18.5.3`, `18.5.2` |
| `@servicetitan/tokens` | `12.9.2`, `12.9.3`, `12.9.1` |
| `@servicetitan/titan-chat-ui` | `7.1.3`, `7.1.5`, `7.1.4` |
| `@servicetitan/moneyout-api-client` | `1.29.1`, `1.29.2`, `1.29.3` |
| `@servicetitan/standalone-core-feature-gates` | `1.11.5`, `1.11.4`, `1.11.6` |
| `verdaccio-tarball-local-storage` | `38.1.2`, `38.1.1`, `38.1.3` |
| `folder-lint` | `1.0.7`, `1.0.6`, `1.0.8` |
| `@servicetitan/micro-frontend` | `0.0.6`, `0.0.4`, `0.0.5` |
| `@servicetitan/carto-react-kit` | `0.8.5`, `0.8.4`, `0.8.6` |
| `@servicetitan/uikit-docs` | `22.11.1`, `22.11.3`, `22.11.2` |
| `eslint-plugin-folder-schema` | `1.0.6`, `1.0.7`, `1.0.8` |
| `@servicetitan/log-service` | `38.1.2`, `38.1.1`, `38.1.3` |
| `@servicetitan/install` | `38.1.2`, `38.1.3`, `38.1.1` |
| `@servicetitan/grid` | `0.0.64`, `0.0.65`, `0.0.63` |
| `@servicetitan/titan-chat-ui-anvil2` | `9.0.1`, `9.0.2`, `9.0.3` |
| `@servicetitan/form-state` | `41.3.1`, `41.3.2`, `41.3.3` |
| `@servicetitan/cp-api` | `1.115.3`, `1.115.2`, `1.115.1` |
| `@servicetitan/carto-rn-kit` | `0.0.12`, `0.0.11`, `0.0.10` |
| `@servicetitan/dte-unlayer` | `0.150.2`, `0.150.3`, `0.150.1` |
| `@servicetitan/kendo-theme` | `0.0.29`, `0.0.27`, `0.0.28` |
| `@servicetitan/anvil-fonts` | `14.5.5`, `14.5.6`, `14.5.4` |
| `@servicetitan/anvil2-ext-common` | `0.7.2`, `0.7.3`, `0.7.1` |
| `@servicetitan/error-boundary` | `38.1.3`, `38.1.2`, `38.1.1` |
| `@servicetitan/startup-utils` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/eslint-plugin` | `38.1.2`, `38.1.3`, `38.1.1` |
| `@servicetitan/titan-chat-ui-common` | `9.0.2`, `9.0.3`, `9.0.1` |
| `@servicetitan/lazy-module` | `38.1.3`, `38.1.1`, `38.1.2` |
| `@servicetitan/carto-tokens` | `0.3.1`, `0.3.2`, `0.3.3` |
| `@servicetitan/anvil2-ext-atlas` | `4.0.2`, `4.0.3`, `4.0.4` |
| `@servicetitan/eslint-plugin-folder-schema` | `38.1.3`, `38.1.2`, `38.1.1` |
| `@servicetitan/measure-sheet-data` | `2.6.1`, `2.6.3`, `2.6.2` |
| `@servicetitan/modularpayments-webfields` | `1.0.54`, `1.0.55`, `1.0.53` |
| `@servicetitan/schema-comparison` | `0.1.4`, `0.1.5`, `0.1.3` |
| `@servicetitan/html-sketchapp` | `4.2.8`, `4.2.9`, `4.2.10` |
| `@servicetitan/cp-ui` | `1.115.1`, `1.115.3`, `1.115.2` |
| `@servicetitan/confirm` | `41.3.2`, `41.3.3`, `41.3.1` |
| `@servicetitan/eslint-plugin-processors-stub` | `12.8.15`, `12.8.17`, `12.8.16` |
| `@servicetitan/stylelint-config` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/eh-module-communication` | `0.2.2`, `0.2.3`, `0.2.1` |
| `@servicetitan/document-title` | `2.4.1`, `2.4.2`, `2.4.3` |
| `@servicetitan/toolbelt-shared-registry` | `1.14.2`, `1.14.3`, `1.14.1` |
| `@servicetitan/react-hooks` | `7.7.2`, `7.7.3`, `7.7.1` |
| `@or-sdk/idw-skill` | `1.4.2`, `1.4.1` |
| `@or-sdk/account-settings` | `1.3.6`, `1.3.7` |
| `@onereach/webform` | `0.3.14`, `0.3.13` |
| `@onereach/font-icons` | `27.0.2`, `27.0.3` |
| `@onereach/styles` | `27.0.2`, `27.0.3` |
| `@or-sdk/source` | `2.1.5`, `2.1.6` |
| `@onereach/orest-vue-demi-vue2` | `0.0.4`, `0.0.5` |
| `@onereach/ui-components` | `27.0.2`, `27.0.3` |
| `@or-sdk/tags` | `1.1.6`, `1.1.5` |
| `@servicetitan/admin-layout` | `2.4.4`, `2.4.5`, `2.4.3` |
| `@onereach/channel-transformers` | `0.0.5`, `0.0.6` |
| `@or-sdk/content-request` | `0.2.6`, `0.2.7` |
| `@servicetitan/anvil2-mcp` | `0.0.9`, `0.0.10`, `0.0.11` |
| `@or-sdk/qna` | `3.4.3`, `3.4.2` |
| `@servicetitan/anvil-icons` | `14.5.6`, `14.5.4`, `14.5.5` |
| `@or-sdk/invitations` | `1.4.9`, `1.4.8` |
| `@onereach/si-text-message` | `0.4.5`, `0.4.6` |
| `@servicetitan/line-item-editor` | `1.5.1`, `1.5.2`, `1.5.3` |
| `@servicetitan/responsive` | `6.1.1`, `6.1.3`, `6.1.2` |
| `@servicetitan/standalone-ui` | `2.2.4`, `2.2.6`, `2.2.5` |
| `verdaccio-okta-oauth` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/widget-platform-monolith` | `5.6.1`, `5.6.3`, `5.6.2` |
| `@servicetitan/titan-chatbot-api` | `9.0.2`, `9.0.1`, `9.0.3` |
| `@servicetitan/design-system` | `14.5.4`, `14.5.5`, `14.5.6` |
| `@servicetitan/anvil-icon` | `0.5.2`, `0.5.1`, `0.5.3` |
| `@servicetitan/datetime-utils` | `41.3.1`, `41.3.2`, `41.3.3` |
| `@servicetitan/carto-charts-rn` | `0.0.2`, `0.0.3`, `0.0.4` |
| `@servicetitan/assist-utils` | `1.1.3`, `1.1.4`, `1.1.2` |
| `@servicetitan/acquisition-functions` | `5.22.3`, `5.22.1`, `5.22.2` |
| `@servicetitan/va-mfe-loader` | `1.1.1`, `1.1.2`, `1.1.3` |
| `@servicetitan/anvil2-codemods` | `0.11.2`, `0.11.3`, `0.11.4` |
| `@servicetitan/folder-lint` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/standalone-tm-api` | `1.1.1`, `1.1.2`, `1.1.3` |
| `@servicetitan/admin-sql-table` | `1.0.16`, `1.0.14`, `1.0.15` |
| `@servicetitan/hash-browser-router` | `38.1.1`, `38.1.3`, `38.1.2` |
| `@servicetitan/ld-type-generator` | `0.2.2`, `0.2.1`, `0.2.3` |
| `@servicetitan/eslint-plugin-decorators-declare` | `12.8.17`, `12.8.16`, `12.8.15` |
| `@servicetitan/react-ioc` | `38.1.1`, `38.1.2`, `38.1.3` |
| `@servicetitan/testing-library` | `6.6.1`, `6.6.2`, `6.6.3` |
| `@servicetitan/titan-chatbot-client` | `2.1.3`, `2.1.4`, `2.1.5` |
| `@servicetitan/microfront-auth` | `0.0.5`, `0.0.6`, `0.0.7` |
| `@servicetitan/confirm-navigation` | `41.3.2`, `41.3.1`, `41.3.3` |
| `@servicetitan/dte-pdf-editor` | `1.76.1`, `1.76.3`, `1.76.2` |
| `@servicetitan/marketing-direct-mail-components` | `20.1.1`, `20.1.2`, `20.1.3` |
| `@servicetitan/navigation` | `14.1.2`, `14.1.3`, `14.1.1` |
| `@servicetitan/marketing-form` | `0.1.2`, `0.1.3`, `0.1.4` |
| `@servicetitan/table` | `41.3.1`, `41.3.2`, `41.3.3` |
| `@servicetitan/examples` | `1.2.6`, `1.2.5`, `1.2.7` |
| `@servicetitan/restrict-imports` | `38.1.2`, `38.1.3`, `38.1.1` |
| `@servicetitan/forge` | `0.5.3`, `0.5.1`, `0.5.2` |
| `@servicetitan/eslint-config` | `38.1.3`, `38.1.1`, `38.1.2` |
| `@servicetitan/anvil2-ext-mwv` | `0.0.7`, `0.0.5`, `0.0.6` |
| `@servicetitan/cp-react-hooks` | `1.115.3`, `1.115.1`, `1.115.2` |
| `rwc-client` | `0.29.10`, `0.29.11`, `0.29.12` |
| `@or-sdk/providers` | `0.3.7`, `0.3.6` |
| `@or-sdk/sku-builder` | `2.5.2`, `2.5.1` |
| `@or-sdk/library-source` | `0.4.5`, `0.4.6` |
| `@or-sdk/contacts` | `4.7.5`, `4.7.6` |
| `@or-sdk/settings` | `0.25.7`, `0.25.6` |
| `@or-sdk/files` | `3.11.7`, `3.11.6` |
| `@or-sdk/graph` | `1.10.6`, `1.10.5` |
| `@servicetitan/anvil-react` | `0.11.4`, `0.11.5`, `0.11.3` |
| `@onereach/condition-builder` | `1.0.8`, `1.0.9` |
| `@or-sdk/tables` | `0.28.6`, `0.28.5` |
| `@servicetitan/assist-ui` | `2.1.2`, `2.1.3`, `2.1.1` |
| `@onereach/si-dropdown-advanced` | `0.4.6`, `0.4.5` |
| `@onereach/idw-apps` | `0.1.3`, `0.1.4` |
| `@or-sdk/knowledge-models` | `0.25.6`, `0.25.5` |
| `@onereach/si-validated-timestring-input` | `0.3.5`, `0.3.6` |
| `@onereach/regex-helper` | `0.5.16`, `0.5.17` |
| `@or-sdk/source-api` | `1.1.2`, `1.1.1` |
| `@or-sdk/view-templates` | `2.2.6`, `2.2.5` |
| `@or-sdk/cards` | `1.2.5`, `1.2.6` |
| `@or-sdk/authorizer` | `0.26.7`, `0.26.8` |
| `@servicetitan/help-center` | `1.0.10`, `1.0.9`, `1.0.8` |
| `@servicetitan/json-render-react` | `0.4.6`, `0.4.8`, `0.4.7` |
| `@servicetitan/widget-platform` | `5.6.1`, `5.6.3`, `5.6.2` |
| `@servicetitan/standalone-feature-flags` | `2.3.2`, `2.3.4`, `2.3.3` |
| `@servicetitan/unit-tests` | `0.0.2`, `0.0.4`, `0.0.3` |
| `tslint-folder-schema` | `1.0.6`, `1.0.8`, `1.0.7` |
| `@servicetitan/marketing-integration-widgets` | `1.0.40`, `1.0.41`, `1.0.42` |
| `@onereach/orest-vue3` | `0.0.4`, `0.0.5` |
| `@onereach/si-collapsible-group` | `0.6.5`, `0.6.4` |
| `@hubsync/web-sdk-react` | `6.3.14`, `6.3.30`, `6.3.7`, `6.3.26`, `6.3.10`, `6.3.16`, `6.3.32`, `6.3.18`, `6.3.17`, `6.3.33`, `6.3.28`, `6.3.31`, `6.3.15`, `6.3.20`, `6.3.9`, `6.3.29`, `6.3.13`, `6.3.27`, `6.3.11`, `6.3.21`, `6.3.8`, `6.3.19`, `6.3.23`, `6.3.24`, `6.3.12`, `6.3.25`, `6.3.22` |
| `@or-sdk/agents` | `4.21.4`, `4.21.3` |
| `@or-sdk/idw-public` | `1.6.7`, `1.6.6` |
| `@onereach/ts-memoize` | `1.0.2`, `1.0.3` |
| `@or-sdk/users` | `3.8.2`, `3.8.1` |
| `@servicetitan/contentful` | `0.0.3`, `0.0.4`, `0.0.5` |
| `@servicetitan/contentful-proxy` | `1.1.12`, `1.1.14`, `1.1.13` |
| `@servicetitan/anvil-themes` | `14.5.4`, `14.5.5`, `14.5.6` |
| `@servicetitan/ajax-handlers` | `38.1.1`, `38.1.2`, `38.1.3` |
| `@servicetitan/data-query` | `41.3.1`, `41.3.2`, `41.3.3` |
| `@servicetitan/thoughtspot-theme` | `1.7.2`, `1.7.3`, `1.7.1` |
| `@servicetitan/titan-chatbot-ui-anvil2` | `9.0.2`, `9.0.3`, `9.0.1` |
| `@servicetitan/tanstack-query-mobx` | `6.2.1`, `6.2.2`, `6.2.3` |
| `@servicetitan/microfront-tests` | `0.0.12`, `0.0.13`, `0.0.11` |
| `@servicetitan/marketing-email-components` | `20.2.3`, `20.2.4`, `20.2.5` |
| `@servicetitan/startup-jest` | `2.2.1`, `2.2.2`, `2.2.3` |
| `@servicetitan/form` | `41.3.2`, `41.3.3`, `41.3.1` |
| `@servicetitan/marketing-global-route` | `1.14.1`, `1.14.2`, `1.14.3` |
| `@servicetitan/feature-spotlight` | `3.9.2`, `3.9.3`, `3.9.1` |
| `@servicetitan/docs-anvil-uikit-contrib` | `41.3.3`, `41.3.1`, `41.3.2` |
| `@servicetitan/datadog-rum` | `38.1.2`, `38.1.3`, `38.1.1` |
| `@or-sdk/library-categories` | `0.2.6`, `0.2.7` |
| `@onereach/bandwidth-steps-voice-bxml` | `0.1.2`, `0.1.1` |
| `@onereach/regular-expressions-test` | `0.0.4`, `0.0.5` |
| `@or-sdk/data-hub` | `0.26.6`, `0.26.5` |
| `@or-sdk/hitl` | `0.41.1`, `0.41.2` |
| `@or-sdk/auth` | `0.38.2`, `0.38.1` |
| `@onereach/si-dropdown-simple` | `0.4.5`, `0.4.6` |
| `@or-sdk/event-manager` | `1.1.5`, `1.1.6` |
| `@onereach/idw-contracts` | `0.1.2`, `0.1.3` |
| `@or-sdk/lookup` | `1.25.2`, `1.25.1` |
| `@onereach/si-header` | `0.4.12`, `0.4.11` |
| `@onereach/types-contacts-api` | `9.0.8`, `9.0.9` |
| `@onereach/content-builder` | `0.0.18`, `0.0.19` |
| `@onereach/ui-components-vue2` | `27.0.3`, `27.0.2` |
| `@or-sdk/store` | `2.1.6`, `2.1.5` |
| `@or-sdk/permissions` | `2.8.2`, `2.8.1` |
| `@or-sdk/apps` | `1.2.7`, `1.2.6` |
| `@or-sdk/accounts` | `2.3.5`, `2.3.6` |
| `@or-sdk/billing` | `27.2.1`, `27.2.2` |
| `@or-sdk/flow-templates` | `2.1.5`, `2.1.6` |
| `@onereach/idw-sdk` | `0.1.2`, `0.1.3` |
| `@onereach/ssml-editor` | `2.0.12`, `2.0.13` |
| `@or-sdk/pgsql` | `1.5.2`, `1.5.1` |
| `@or-sdk/adapters` | `0.3.6`, `0.3.7` |
| `@servicetitan/carto-charts-core` | `0.0.2`, `0.0.3`, `0.0.4` |
| `@or-sdk/views` | `3.1.5`, `3.1.6` |
| `@or-sdk/notifications` | `1.7.6`, `1.7.5` |
| `@onereach/si-merge-tag-input` | `0.4.5`, `0.4.6` |
| `@onereach/regular-expressions` | `0.5.23`, `0.5.24` |
| `@or-sdk/deployer` | `1.7.6`, `1.7.5` |
| `@servicetitan/hammer-icon` | `1.2.1`, `1.2.2`, `1.2.3` |
| `@onereach/si-switch` | `0.4.6`, `0.4.5` |
| `@or-sdk/keys` | `1.2.7`, `1.2.6` |
| `@or-sdk/bot-templates` | `2.2.6`, `2.2.5` |
| `@onereach/orest-cli` | `2.4.2`, `2.4.1` |
| `@onereach/si-copyable-text` | `0.4.12`, `0.4.11` |
| `@onereach/pnpm-audit-junit` | `1.0.4`, `1.0.3` |
| `@onereach/channel-transformer` | `0.0.67`, `0.0.66` |
| `@onereach/or-pro` | `1.13.1`, `1.13.2` |
| `@onereach/slack-helpers` | `1.0.4`, `1.0.3` |
| `@onereach/si-alert` | `0.4.11`, `0.4.12` |
| `@onereach/phonenumber-interpreter` | `0.0.18`, `0.0.19` |
| `@onereach/ui-components-common` | `27.0.3`, `27.0.2` |
| `@onereach/si-select` | `0.1.3`, `0.1.4` |
| `@onereach/step-components` | `0.1.38`, `0.1.37` |
| `@onereach/or-browser` | `0.0.49`, `0.0.48` |
| `@or-sdk/deployments` | `2.1.5`, `2.1.6` |
| `@onereach/time-interpreter` | `1.0.30`, `1.0.31` |
| `@or-sdk/library` | `0.5.7`, `0.5.6` |
| `@or-sdk/chat` | `0.3.1`, `0.3.2` |
| `@or-sdk/billing-internal` | `27.2.1`, `27.2.2` |
| `@or-sdk/queue-manager` | `1.4.7`, `1.4.6` |
| `@onereach/si-divider` | `0.4.12`, `0.4.11` |
| `@or-sdk/web-search` | `0.6.2`, `0.6.1` |
| `@servicetitan/anvil2-ext-charts` | `0.2.4`, `0.2.6`, `0.2.5` |
| `@or-sdk/transcripts` | `1.2.5`, `1.2.6` |
| `@or-sdk/password` | `1.3.6`, `1.3.7` |
| `@or-sdk/library-types-v1` | `9.0.1`, `9.0.2` |
| `@or-sdk/idw` | `9.0.4`, `9.0.5` |
| `@or-sdk/ccp` | `10.15.4`, `10.15.5` |
| `@or-sdk/bots` | `1.7.1`, `1.7.2` |
| `@servicetitan/carto-charts-react` | `0.0.4`, `0.0.3`, `0.0.2` |
| `@servicetitan/cp-mfe-dev` | `1.115.3`, `1.115.2`, `1.115.1` |
| `@onereach/messengers-infobip-sdk` | `0.1.2`, `0.1.1` |
| `@onereach/content-builder-template-compiler` | `0.0.4`, `0.0.3` |
| `@onereach/si-list` | `0.7.4`, `0.7.5` |
| `@onereach/si-checkbox` | `0.6.5`, `0.6.6` |
| `@or-sdk/sdk-api` | `0.29.3`, `0.29.2` |
| `@servicetitan/anvil-token` | `0.4.3`, `0.4.2`, `0.4.1` |
| `@or-sdk/identifiers` | `0.27.7`, `0.27.6` |
| `@or-sdk/payments` | `3.2.6`, `3.2.5` |
| `@or-sdk/step-templates` | `2.2.6`, `2.2.5` |
| `@servicetitan/anvil-css-utilities` | `14.5.6`, `14.5.5`, `14.5.4` |
| `@or-sdk/base` | `0.44.5`, `0.44.4` |
| `@servicetitan/hammer-react` | `1.42.3`, `1.42.2`, `1.42.4` |
| `@or-sdk/key-value-storage` | `0.28.7`, `0.28.6` |
| `@or-sdk/tickets` | `1.9.5`, `1.9.6` |
| `@or-sdk/flows` | `2.7.9`, `2.7.8` |
| `@onereach/v-event-calendar` | `0.1.23`, `0.1.22` |
| `@or-sdk/druid` | `1.4.8`, `1.4.7` |
| `@or-sdk/permissions-lambda` | `2.5.2`, `2.5.1` |
| `@picsart/gen-ai` | `2.55.11` |
| `@onereach/rwc-client` | `6.4.7`, `6.4.8` |
| `@or-sdk/discovery` | `1.12.2`, `1.12.1` |
| `@onereach/postcss-scoped-selector` | `1.2.2`, `1.2.1` |
| `@onereach/get-version-data` | `3.1.3`, `3.1.2` |
| `@picsart/ai-sdk` | `3.32.2` |
| `@onereach/or-sdk-agent-cli` | `0.0.7`, `0.0.6` |
| `@or-sdk/library-types-v2` | `9.0.1`, `9.0.2` |
| `@onereach/expression-components` | `9.1.1`, `9.1.2` |
| `@onereach/orest-vue-demi-vue3` | `0.0.5`, `0.0.4` |
| `@onereach/step-run-snowflake-query` | `0.1.2`, `0.1.1` |
| `@onereach/idw-init-account-resources` | `1.0.2`, `1.0.1` |
| `@or-sdk/data-hub-svc` | `2.3.5`, `2.3.6` |
| `example-js-project` | `1.0.4`, `1.0.2`, `1.0.3` |
| `@onereach/orest-jest-presets` | `0.0.3`, `0.0.4` |
| `@onereach/step-voice` | `7.0.33`, `7.0.32` |
| `@onereach/si-a-button` | `0.0.4`, `0.0.3` |
| `@onereach/or-file-uploader-next` | `0.0.9`, `0.0.8` |
| `@onereach/si-root` | `0.9.5`, `0.9.4` |
| `@or-sdk/api-tokens-lambda` | `1.4.3`, `1.4.2` |
| `@or-sdk/api-tokens` | `1.4.3`, `1.4.2` |
| `@onereach/step-conversation` | `1.0.41`, `1.0.42` |
| `conv-context-next` | `1.0.1`, `1.0.3`, `1.0.2` |
| `@onereach/cb-schema-translator` | `1.3.1`, `1.3.2` |
| `@onereach/si-checkbox-group` | `0.3.6`, `0.3.5` |
| `@onereach/si-step-chooser` | `0.4.4`, `0.4.5` |
| `@or-sdk/mcp-tools` | `0.5.2`, `0.5.3` |
| `@or-sdk/markdowner` | `0.5.1`, `0.5.2` |
| `@onereach/si-textinput` | `0.5.5`, `0.5.6` |
| `@onereach/ckeditor5-build-classic` | `30.0.1`, `30.0.2` |
| `@onereach/lambda-invocation` | `1.2.2`, `1.2.1` |
| `@onereach/si-radio-group` | `0.3.6`, `0.3.5` |
| `@onereach/si-code` | `0.6.4`, `0.6.5` |
| `@onereach/salesforce-miaw-client` | `0.0.4`, `0.0.3` |
| `@onereach/or-browser-next` | `0.0.11`, `0.0.12` |
| `@onereach/billing-shared` | `27.2.2`, `27.2.1` |
| `@or-sdk/permissions-cli` | `1.4.2`, `1.4.1` |
| `@arv-bedrock/auth-admin` | `1.0.3`, `1.0.2` |
| `@onereach/billing-dto` | `27.2.2`, `27.2.1` |
| `@ornikar/renovate-config` | `9.0.4`, `9.0.2`, `9.0.3` |
| `@ornikar/rollup-config` | `11.1.2`, `11.1.3`, `11.1.4` |
| `@ornikar/postcss-config` | `9.1.2`, `9.1.3` |
| `@arv-bedrock/logger` | `1.7.2`, `1.7.1` |
| `@deliveroo/reevent` | `1.0.1` |
| `pob-test-typescript-package-in-monorepo` | `4.2.2`, `4.2.3`, `4.2.1` |
| `@ornikar/eslint-plugin-ornikar` | `24.0.1`, `24.0.2`, `24.0.3` |
| `@ornikar/eslint-config-react` | `24.0.2`, `24.0.1` |
| `@ornikar/jest-config-react-native` | `17.0.4`, `17.0.3`, `17.0.2` |
| `@onereach/idw-ui-components` | `0.1.2`, `0.1.3` |
| `@arv-bedrock/auth-sso-backend` | `1.7.2`, `1.7.1` |
| `@onereach/orest-input-cli` | `1.18.2`, `1.18.1` |
| `@deliveroo/determinator` | `0.2.1` |
| `@arv-bedrock/auth-sso` | `1.6.1`, `1.6.2` |
| `@onereach/authorizer-helper` | `0.0.11`, `0.0.12` |
| `@onereach/si-datepicker` | `0.4.6`, `0.4.5` |
| `@onereach/or-content-builder-renderer` | `0.0.3`, `0.0.2` |
| `@arv-bedrock/auth` | `1.1.7`, `1.1.8` |
| `@or-sdk/files-sync-node` | `0.1.9`, `0.1.8` |
| `@or-sdk/card-templates` | `2.2.5`, `2.2.6` |
| `ecto` | `5.0.1` |
| `frontend-orb` | `4.4.2`, `4.4.3`, `4.4.1` |
| `@ornikar/rollup-plugin-postcss` | `2.0.7`, `2.0.6`, `2.0.5` |
| `@ornikar/jest-config` | `13.0.5`, `13.0.4`, `13.0.3` |
| `@ornikar/prismic-components` | `0.0.3`, `0.0.4`, `0.0.2` |
| `@ornikar/repo-config-react-legacy-css` | `15.1.4`, `15.1.2`, `15.1.3` |
| `@ornikar/intl-config` | `10.0.3`, `10.0.2` |
| `@ornikar/eslint-config` | `24.0.1`, `24.0.3`, `24.0.2` |
| `@ornikar/repo-config-react` | `13.0.10`, `13.0.9`, `13.0.8` |
| `@ornikar/babel-preset-react` | `6.1.4`, `6.1.6`, `6.1.5` |
| `@ornikar/slate-react-fork` | `1.0.1`, `1.0.2` |
| `babel-plugin-linaria-css-to-undefined` | `0.3.2`, `0.3.1` |
| `@ornikar/eslint-config-typescript-nestjs` | `24.0.1`, `24.0.2` |
| `@ornikar/apollo-link-timeout` | `1.4.2`, `1.4.3` |
| `@ornikar/commitlint-config` | `8.3.3`, `8.3.2` |
| `@ornikar/prettier-config` | `9.0.3`, `9.0.4`, `9.0.5` |
| `@ornikar/jest-config-react` | `18.0.3`, `18.0.4`, `18.0.2` |
| `@ornikar/eslint-config-typescript-react` | `24.0.1`, `24.0.2`, `24.0.3` |
| `@ornikar/eslint-config-babel-use` | `13.2.2`, `13.2.3`, `13.2.1` |
| `@ornikar/babel-preset-base` | `6.0.3`, `6.0.4`, `6.0.5` |
| `@ornikar/webpack-config` | `12.0.3`, `12.0.2` |
| `@ornikar/graphql-config` | `1.1.1`, `1.1.2`, `1.1.3` |
| `@ornikar/eslint-config-typescript` | `24.0.1`, `24.0.2` |
| `@ornikar/eslint-config-babel` | `24.0.1`, `24.0.3`, `24.0.2` |
| `@ornikar/babel-preset-kitt-universal` | `8.0.3`, `8.0.4` |
| `@ornikar/eslint-config-node` | `12.2.1`, `12.2.2` |
| `@ornikar/monorepo-config` | `14.3.2`, `14.3.4`, `14.3.3` |
| `@ornikar/jest-config-react-native-web` | `12.0.5`, `12.0.3`, `12.0.4` |
| `@ornikar/repo-config` | `15.3.3`, `15.3.5`, `15.3.4` |
| `@ornikar/eslint-plugin-neverthrow` | `1.3.3`, `1.3.1`, `1.3.2` |
| `pob-test-package-in-monorepo` | `5.2.2`, `5.2.3`, `5.2.1` |
| `native-frontend-orb` | `1.1.5`, `1.1.6`, `1.1.4` |
| `@ornikar/stylelint-config` | `14.0.4`, `14.0.3` |
| `@ornikar/react-modern-calendar-datepicker` | `3.2.2`, `3.2.1` |
| `@ornikar/kitt2` | `1.0.2`, `1.0.1` |
| `@ornikar/browserslist-config` | `8.0.3`, `8.0.4` |
| `@ornikar/storybook-config` | `12.1.2`, `12.1.3` |
| `@ornikar/eslint-config-formatjs` | `24.0.1`, `24.0.2` |
| `@ornikar/react-native-svg-transformer` | `1.0.6`, `1.0.7` |
| `@ornikar/lerna-config` | `11.0.1`, `11.0.2` |
| `@ornikar/typed-css-modules-loader` | `0.8.3`, `0.8.2` |
| `@cacheable/memory` | `2.2.1` |
| `cache-manager` | `7.2.10` |
| `@cacheable/utils` | `2.5.1` |
| `@cacheable/net` | `2.1.1` |
| `@cacheable/node-cache` | `3.1.2` |
| `file-entry-cache` | `11.1.6` |
| `cacheable` | `2.5.1` |
| `@thiennq/docs-viewer` | `1.6.2` |
| `keyv` | `6.0.0` |
