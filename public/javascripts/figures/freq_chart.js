Diction.Figures.FreqChart = Backbone.View.extend({

  tooltipTemplate: new EJS({ url: '/templates/tooltip.html.ejs' }),

  sentencesTemplate: new EJS({ url: '/templates/sentences.html.ejs' }),

  initialize: function(attrs) {
    var defaults = {
      height: 300,
      svg: d3.select('#figure'),
      data: [],
      margin: { top: 10, bottom: 50, left: 50, right: 10 },
      docs: new Diction.Collections.Doc()
    };

    _.defaults(this, attrs, defaults);

    this.docHash = {};

    this.docs.each(function(doc) {
      this.docHash[doc.get('documentId')] = doc;
    }.bind(this));

    this.width = this.docs.length + this.margin.left + this.margin.right;

    this.x = d3.scale.ordinal()
      .domain(this.docs.map(function(d, i) { return d.get('documentId'); }))
      .range(this.docs.map(function(d, i) { return i; }));

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat('')
      .tickSize(0);

    this.tippedEl = null;

    this.g = this.svg.append('svg')
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.height = this.height - this.margin.top - this.margin.bottom;

    this.y = d3.scale.linear()
      .domain([0, 50])
      .range([this.height, 0]);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(5)
      .orient("left")
      .tickSize(-this.width, 0, 0)
      .tickPadding(8);

    this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + this.height + ')')
      .call(this.xAxis);

    this.g.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);
  },

  render: function() {
    var x = this.x,
        y = this.y,
        self = this,
        docHash = this.docHash;



    if (this.tippedEl) {
      $(this.tippedEl).tipsy('hide');
    }
    // Background bars for hover
    //var backgroundBars = this.g.selectAll('.background-bar')
    //    .data(this.data.sort(this.compare.bind(this)), function(d) {
    //      return d.documentId;
    //    });


    //backgroundBars.enter().append('rect');
    //backgroundBars
    //  .attr('y', y(0))
    //  .attr('original-title', 'her there')
    //  .attr('height', function(d, i) {
    //    return this.height;
    //  }.bind(this))
    //  .attr('y', function(d, i) {
    //    return 0;
    //  })
    //  .attr('x', function(d, i) {
    //    return x(d.documentId);
    //  })
    //  .attr('width', function(d, i) {
    //    return 1;
    //  })
    //  .attr('class', function(d, i) {
    //    return ['background-bar', d.documentId].join(' ');
    //  });

      // Actual bars
      max = d3.max(this.data, function(d) { return d.count; }) || 0;
      if (max < 30)
        max = 30;

      y.domain([0, max]);
      var bars = this.g.selectAll('.bar').data(this.data.sort(this.compare.bind(this)), function(d) {
        return d.documentId;
      });
      bars.enter().append('rect');
      bars
        .attr('class', function(d, i) {
          return ['bar', d.documentId, docHash[d.documentId].get('author')].join(' ');
        })
        .attr('original-title', function(d) {
          //return 'Date: ' + new Date(docHash[d.documentId].get('date')) + '\n' + 'Count: ' + d.count;
          return self.tooltipTemplate.render(_.extend(d, docHash[d.documentId].toJSON()));
        })
        .transition()
        .duration(Diction.Constants.DURATION)
          .attr('y', y(0))
          .attr('height', function(d, i) {
            return y(0) - y(d.count);
          })
          .attr('y', function(d, i) { return y(d.count); })
          .attr('x', function(d, i) { return x(d.documentId); })
          .attr('width', function(d, i) { return 1; });

      bars.on('mouseover', function(d) {
        if (self.tippedEl) {
          $(self.tippedEl).tipsy('hide');
        }
        $el = $(this);
        $el.tipsy('show');

        // Show sentences on tooltip click
        $('.tipsy-show a').on('click', function() {
          $.get('/sentences', { word: d.word, documentId: d.documentId }, function(sentences) {
            $el.attr('original-title', self.sentencesTemplate.render({
              sentences: sentences
            }));
            $el.tipsy('show');

            $('.tipsy-back').on('click', function() {
              var html = self.tooltipTemplate.render(_.extend(d, docHash[d.documentId].toJSON()));
              $el.attr('original-title', html);
              $el.tipsy('show');
            });
          });
        });

        // Return to normal tooltip
        self.tippedEl = this;
      });

      bars.exit()
        .transition()
        .duration(Diction.Constants.DURATION)
        .attr('height', 0)
        .attr('y', y(0))
        .remove();

      this.g.select('.y.axis')
        .transition()
        .duration(Diction.Constants.DURATION)
        .call(this.yAxis);

      $('.bar').tipsy({
        html: true,
        trigger: 'manual',
        gravity: 's'
      });
  },

  compare: function(a, b) {
    return new Date(this.docHash[b.documentId].get('date')) - new Date(+this.docHash[a.documentId].get('date'));
  },

  dataFn: function(_data) {
    if (arguments.length) {
      this.data = _data;
      return this;
    }
    return this.data;
  }




});