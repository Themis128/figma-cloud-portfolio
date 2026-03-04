# Builder.io Usage Examples

## Render a Page Model

```tsx
<BuilderPage url={location.pathname} model="page" />
```

## Render a Section or Banner

```tsx
<BuilderPage url="/homepage-banner" model="banner" />
```

## Pass User Attributes for Personalization

```tsx
<BuilderPage
  url={location.pathname}
  model="page"
  userAttributes={{
    id: user.id,
    role: user.role,
    country: user.country,
    abTestGroup: abGroup,
  }}
/>
```

## Track a Custom Analytics Event

```tsx
import { trackBuilderEvent } from "@/components/BuilderProvider";
trackBuilderEvent("ctaClick", { label: "Hero CTA" });
```

## Track an A/B Test Assignment

```tsx
import { trackABTest } from "@/components/BuilderProvider";
trackABTest("HomepageHero", "variantA");
```
