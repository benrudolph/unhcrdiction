var Diction = {
  Constants: {
    ENTER: 13,
    DURATION: 1000,
    DEFAULT_QUERY: 'refugee'
  },
  Figures: {},
  Routers: {},
  Models: {},
  Views: {},
  Formats: {
    COMMA: d3.format(',')
  },
  Collections: {},
  Templates: {
    wordsPerYear: new EJS({ url: '/templates/words_per_year.html.ejs'}),
    wordsPerYearTooltip: new EJS({ url: '/templates/words_per_year_tooltip.html.ejs'}),
    authorIndex: new EJS({ url: '/templates/author/index.html.ejs' }),
    authorShow: new EJS({ url: '/templates/author/show.html.ejs' })
  },
};

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

