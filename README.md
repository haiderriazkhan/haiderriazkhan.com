# Personal Website

This Jekyll theme powers my [personal website](haiderriazkhan.com/).

This is forked from [Jaan Altosaar's](https://jaan.io) Jekyll [theme](https://github.com/altosaar/jaan.io).



## Testing locally

`jekyll serve --config _config.yml,_config_dev.yml --watch`

`scss -t compress assets/sass/i.scss assets/css/i.css`

## Deploying

Deploy with [s3_website](https://github.com/laurilehmijoki/s3_website).
`jekyll build`
`s3_website push`

### Managing ruby on a mac
Use rbenv. As in [this guide](https://gorails.com/setup/osx/10.12-sierra).

On a mac, use rvm for managing ruby environment.

Use bundler for managing gems:
`gem install bundler`
Run from root of the repo:
`bundler install`
Important: need to rehash to create symbolic links to gems like jekyll -
`rbenv rehash`
Then run jekyll commands:
`jekyll build`


### Workflow for creating vector graphics for blog posts
* Use keynote to make figures.
* Export to pdf.
* Crop in preview.
* Use inkscape to convert to svg: `inkscape --without-gui --file=in.pdf --export-plain-svg=out.svg`
* Put in `_svg` folder, include using `{% asset out.svg %}`

## License

Use this for anything you want.
