## teztnets.xyz page

1. Github Action Builds markdown files from jinja templates.
1. Rendered markdown moved to the website folder
1. Github Action performs jekyll build of static site
1. static site committed and pushed to gh-pages
1. This triggers another (default) GH action workflow to deploy the hosted page
