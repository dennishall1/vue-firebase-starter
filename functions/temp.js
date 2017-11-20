var s = document.createElement('script')
s.src = 'https://code.jquery.com/jquery-3.2.1.min.js'
document.body.appendChild(s)

var results = [];


var game = {};
var commentSplit;
var key;
var value;
Array.prototype.forEach.call($('.schedules-table:last')[0].childNodes, function(item) {
  var el = $(item);
  switch(item.nodeName){
    case 'LI':
      if(el.is('.schedules-list-date')) {
        return;
      }
      game.gameid = el.attr('data-gameid');
      game.state = el.attr('data-gamestate'); // PRE, ?, POST
      game.type = el.attr('data-gametype');
      getTeamData(el, 'away', game);
      getTeamData(el, 'home', game);
      results.push(game);
      game = {};
      break;
    case '#comment':
      commentSplit = item.nodeValue.split(/ |: /g);
      key = commentSplit[1].replace('game.', '').replace('gameKey.key', 'date');
      value = commentSplit.slice(2, -1).join(' ');
      if(!/List/.test(key) && !(key === 'currentWeek' && value === '0')){
        game[key] = value;
      }
      break;
  }
})

function getTeamData(el, homeOrAway, game){
  var teamIndex = homeOrAway === 'home' ? 1 : 0;
  var teamScoreElement = el.find('.team-score.' + homeOrAway);
  game[homeOrAway + 'TeamLogo'] = (el.find('.team-logo').eq(teamIndex).find('span').css('background-image') || '').slice(4, -1);
  game[homeOrAway + 'TeamHelmet'] = el.find('.schedules-list-content-bd-helmet').eq(teamIndex).find('img').attr('src');
  game[homeOrAway + 'TeamCity'] = el.find('.schedules-list-content-bd-city').eq(teamIndex).text();
  if(teamScoreElement[0]){
    game[homeOrAway + 'TeamScore'] = teamScoreElement.text();
  }
}
