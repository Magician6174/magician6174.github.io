---
layout: page
title: Blog
permalink: /blog/
---

{% if site.posts.size > 0 %}
{% for post in site.posts %}
- [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
{% else %}
Read my [project write-ups]({{ '/projects/' | relative_url }}) for notes on implementation, evaluation, and debugging.
{% endif %}
