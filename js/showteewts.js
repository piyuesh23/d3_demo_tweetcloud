var showtweets = function(data) {
  var nodes = [],
    links = [],
    id = {};
  var node, link;

  d3.selectAll('line,text').remove();

  var force = d3.layout.force()
    .size([940, 600])
    .charge(-10)
    .nodes(nodes)
    .links(links)
    .on('tick', function() {
      link.attr('x1', function(d) {
          return d.source.x;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('y2', function(d) {
          return d.target.y;
        })

      node.attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        })
    });

  var add = function(tweet) {
    nodes.push(tweet);
    id[tweet.id_str] = nodes.length - 1;
    if (tweet.in_reply_to_status_id_str) {
      var target = id[tweet.in_reply_to_status_id_str];
      if (target) {
        links.push({
          source: nodes.length - 1,
          target: target
        });
      }
    }

    link = d3.select('.lines').selectAll('line')
      .data(links);
    link.enter().append('line')
      .style('stroke', '#000');
    node = d3.select('.nodes').selectAll('circle')
      .data(nodes);
    node.enter().append('circle')
      .attr('r', '5')
      .style('fill', function(d) {
        d3.select('audio')[0][0].play();
        return d.in_reply_to_status_id_str ? 'blue' :
          d.text.match(/^RT/) ? 'red' : 'black';
      })
      .call(force.drag)
      .append('title')
      .text(function(d) {
        return '@' + d.user.screen_name + ': ' + d.text;
      });
    force.start();
  };

  var start, when, timer, speedup = 10000;
  var time = d3.select('#time'),
    animstart = new Date();
  var timeformat = d3.time.format('%a %b %d, %I:%M %p')
  data.reverse();
  d3.map(data).forEach(function(i, tweet) {
    if (!start) {
      add(tweet);
      start = new Date(tweet.created_at);
      timer = setInterval(function() {
        time.text(timeformat(new Date(+start + (new Date() - animstart) * speedup)));
      }, 100);
    } else {
      when = (new Date(tweet.created_at) - start) / speedup;
      setTimeout(function() {
        add(tweet)
      }, when);
    }
  });
  setTimeout(function() {
    clearInterval(timer);
  }, when);
};

var file = location.search.slice(1) || 'jsfoo';
d3.json('/sites/all/modules/d3_demo/dummy_json/tweet-' + file + '.js', showtweets);
