var CV = {
  labels: undefined,
  init: function(){

    function loadData(callback){
      $.getJSON( 'data/values.json', function( values ) {
        $.getJSON( 'data/cc200_labels.json', function( labels ) {
          callback(values, labels)
        });
      });
    }

    loadData(function(values, labels){

      CV.values = values;
      CV.labels = labels;

      CV.createList(values);

      window.brain_view = new NeuroView($, $('#brain'), 'data/cc200.json', ['xy', 'yz', 'xz'], {
        highlight: false
      });

      var range = d3.scale.linear().domain([0, 1]).range([0, 255]);

      brain_view.color = function(region){
        var v = CV.values[region];
        var c = range(v);
        return d3.rgb(c, c, c).toString();
      };

      brain_view.onload(function(){
        $('#regions .list-group a:first').click();
      });

      brain_view.onchange(function(o, n){
        if(o == undefined || n == undefined)
          return;
        if(brain_view.val(o) == brain_view.val(n))
          return;
        CV.setParcel(n);
      });

    });

  },
  createList: function(values){

    var values = Object.keys(values).map(function(key){
      return [parseInt(key), values[key]];
    });

    values.sort(function(a, b) {
      if (a[1] === b[1]) return 0;
      else return (a[1] > b[1]) ? -1 : 1;
    });

    var max = 10;
    for(var i in values){
      if(max == 0) break;
      max--;
      var elem = $('<a href="#" class="list-group-item"><h4 class="list-group-item-heading"></h4><p class="list-group-item-text"></p></a>');
      elem.data({region: values[i][0]}).click(function(){
        var r = $(this).data('region');
        var p = brain_view.centerAt(r);
        CV.setParcel(p);
        return false;
      });
      elem.find('h4').html('Parcel ' + values[i][0]);
      elem.find('p').html('Relevance: '+  Math.round((values[i][1]*100) * 100) / 100)
      $('#regions .list-group').append(elem)
    }

    CV.places = {};
    var place = 1;
    for(var i in values){
      CV.places[values[i][0]] = place;
      place++;
    }
  },
  setParcel: function(p){
    var val = brain_view.val(p);
    if(val == 0){
      $('#brain_info').html('&nbsp;');
      $('#labels').addClass('hide');
      $('#labels .list-group *').remove();
      $('#regions .list-group a').removeClass('active');
    } else if(val != CV.labelled){
      CV.labelled = val;
      if($('#brain_info').data('region') == val)
        return;
      $('#brain_info').data({region: val}).html('Parcel ' + val)
        .append($('<span class="pull-right"/>').html(CV.places[val] + 'º'));
      $('#regions .list-group a').removeClass('active');
      $('#regions .list-group a').filter(function() {
        return $(this).data('region') && $(this).data('region') == val;
      }).addClass('active');
      $('#labels .list-group *').remove();
      var val_labels = CV.labels[val]['labels'];
      for(var atlas in val_labels){
        var atlas_labels = val_labels[atlas];
        var tmpl = $('<div class="panel panel-default"><div class="panel-body"></div></div>');
        var body = $('.panel-body', tmpl);
        body.append($('<h4/>').html(atlas));
        body.append($('<ul/>'));
        for(var l in atlas_labels){
          if(atlas_labels[l][0] == 'None')
            continue;
          $('.panel-body ul', tmpl).append($('<li />').html(atlas_labels[l][0]));
        }
        if($('.panel-body ul li', tmpl).size() > 0)
          $('#labels .list-group').append(tmpl);
      }
      if($('#labels .panel').size() > 0)
        $('#labels').removeClass('hide');
    }
  },
};


$(document).ready(function(){
  CV.init();
});
