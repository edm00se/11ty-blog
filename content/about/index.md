---
layout: layouts/base.njk
eleventyNavigation:
  key: About
  order: 3
---

{%- css %}
main {
  text-align: center;
}
{%- endcss %}

# {{ ghProfile.name }}

<img alt="it me" src="{{ ghProfile.avatar_url }}&size=260" style="margin-left: auto;margin-right: auto;display: inherit;border-radius: 50%;" />

{{ ghProfile.bio }}
