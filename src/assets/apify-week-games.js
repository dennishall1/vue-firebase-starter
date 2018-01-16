/* eslint-disable */

/* Get all upcoming games
*/
function pageFunction () {
  //var $ = context.jQuery;
  var results = [];
  var game = {};
  var commentSplit;
  var key;
  var value;
  var listMatchupRowTime;
  var year;
  var month;
  var day;
  var hour;
  var minute;
  Array.prototype.forEach.call(document.querySelectorAll('.schedules-table'), function(scheduleTable, tableIndex) {

    // skip the first one, it is a duplicate
    if (!tableIndex) return;

    Array.prototype.forEach.call(scheduleTable.childNodes, function(item) {
      switch(item.nodeName){
        case 'LI':
          if(item.classList.contains('schedules-list-date')) {
            return;
          }
          getTeamData(item, 'away', game);
          getTeamData(item, 'home', game);
          listMatchupRowTime = item.getElementsByClassName('.list-matchup-row-time')[0];
          game.phase = listMatchupRowTime && /final/i.test(listMatchupRowTime.innerText) ? 'FINAL' : '';
          Object.keys(item.dataset).forEach(function(dataKey){
            game[dataKey] = item.dataset[dataKey].trim();
          });
          year = parseInt(game.gameId.substr(0, 4), 10);
          month = parseInt(game.gameId.substr(4, 2), 10) - 1;
          day = parseInt(game.gameId.substr(6, 2), 10);
          if(game.formattedDate && game.formattedTime) {
            hour = parseInt(game.formattedTime, 10) + (game.formattedTime.match(/pm/i) ? 12 : 0);
            minute = parseInt(game.formattedTime.split(/:| /g)[1], 10);
          } else {
            // todo: Figure out what all of the timezones are for each home team and use the `localtime`
            // todo: Never use `gameTimeEastern`, and just always use `isoTime`
            hour = 9;
            minute = 0;
          }
          game.gameId = +game.gameId;
          game.isoTime = (new Date(year, month, day, hour, minute)).getTime();
          // "12/31/2017";
          game.gameDate = [month, day, year].join('/');
          // "16:25:00"
          game.gameTimeEastern = [pad(hour), pad(minute), '00'].join(':');
          delete game.game; // useless java object reference
          delete game.gameid; // dupe of .gameId
          delete game.shareid; // useless
          delete game.tnf; // useless
          delete game.gcUrl; // game center url .. MAYBE keep this...
          game.phase = game.gamestate === 'POST' ? 'FINAL' : game.gamestate;
          delete game.gamestate;
          game.homeTeam = game.homeTeam || {};
          game.homeTeam.abbr = game.homeAbbr;
          game.homeTeam.nick = game.homeName;
          getStaticDataForTeam(game.homeTeam);
          delete game.homeAbbr;
          delete game.homeName;
          delete game.homeMascot;
          game.visitorTeam = game.visitorTeam || {};
          game.visitorTeam.abbr = game.awayAbbr;
          game.visitorTeam.nick = game.awayName;
          getStaticDataForTeam(game.visitorTeam);
          delete game.awayAbbr;
          delete game.awayName;
          delete game.awayMascot;

          results.push(game);
          game = {};
          break;
        case '#comment':
          commentSplit = item.nodeValue.split(/ |: /g);
          key = commentSplit[1].replace('game.', '').replace('gameKey.key', 'date');
          value = commentSplit.slice(2, -1).join(' ');
          if(!/List/.test(key) && !(key === 'currentWeek' && value === '0')){
            game[key] = value.trim();
          }
          break;
      }
    });

  });

  function getTeamData (el, homeOrAway, game) {
    var homeOrVisitorTeam = (homeOrAway === 'home' ? 'home' : 'visitor') + 'Team';
    var contentNode = el.querySelector('.schedules-list-content');
    var teamScoreElement = el.querySelector('.team-score.' + homeOrAway);
    // var teamIndex = homeOrAway === 'home' ? 1 : 0;
    //game[homeOrAway + 'TeamLogo'] = (el.getElementsByClassName('.team-logo')[teamIndex].getElementsByTagName('span')[0].css('background-image') || '').slice(4, -1);
    //game[homeOrAway + 'TeamHelmet'] = el.getElementsByClassName('.schedules-list-content-bd-helmet')[teamIndex].getElementsByTagName('img')[0].getAttribute('src');
    //game[homeOrAway + 'TeamCity'] = el.getElementsByClassName('.schedules-list-content-bd-city')[teamIndex].innerText.trim();
    game.gameId = el.querySelector('[data-gameid]').getAttribute('data-gameid');
    if (contentNode) {
      Object.keys(contentNode.dataset).forEach(function (key) {
        game[key] = contentNode.dataset[key].trim();
      });
    }

    if (teamScoreElement) {
      game[homeOrVisitorTeam] = game[homeOrVisitorTeam] || {};
      game[homeOrVisitorTeam].score = Number(teamScoreElement.innerText.trim());
    }
  }

  function pad(n){
    return (n > 9 ? '' : '0') + n;
  }

  function getStaticDataForTeam (teamObj) {
    var teams = [
      {
        "season": 2017,
        "teamId": "3800",
        "abbr": "ARI",
        "cityState": "Arizona",
        "fullName": "Arizona Cardinals",
        "nick": "Cardinals",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCW",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0018", "abbr": "NCW", "fullName": "NFC West Division"},
        "yearFound": 1920,
        "stadiumName": "University of Phoenix Stadium",
        "ticketPhoneNumber": "602-379-0102",
        "teamSiteUrl": "http://www.azcardinals.com/",
        "teamSiteTicketUrl": "http://www.azcardinals.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0200",
        "abbr": "ATL",
        "cityState": "Atlanta",
        "fullName": "Atlanta Falcons",
        "nick": "Falcons",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCS",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0020", "abbr": "NCS", "fullName": "NFC South Division"},
        "yearFound": 1966,
        "stadiumName": "Mercedes-Benz Stadium",
        "ticketPhoneNumber": "404-223-8444",
        "teamSiteUrl": "http://www.atlantafalcons.com/",
        "teamSiteTicketUrl": "http://www.atlantafalcons.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0325",
        "abbr": "BAL",
        "cityState": "Baltimore",
        "fullName": "Baltimore Ravens",
        "nick": "Ravens",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACN",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0013", "abbr": "ACN", "fullName": "AFC North Division"},
        "yearFound": 1996,
        "stadiumName": "M&T Bank Stadium",
        "ticketPhoneNumber": "410-261-RAVE (7283)",
        "teamSiteUrl": "http://www.baltimoreravens.com/",
        "teamSiteTicketUrl": "http://www.baltimoreravens.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0610",
        "abbr": "BUF",
        "cityState": "Buffalo",
        "fullName": "Buffalo Bills",
        "nick": "Bills",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACE",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0012", "abbr": "ACE", "fullName": "AFC East Division"},
        "yearFound": 1960,
        "stadiumName": "New Era Field",
        "ticketPhoneNumber": "877-BB-TICKS",
        "teamSiteUrl": "http://www.buffalobills.com/",
        "teamSiteTicketUrl": "http://www.buffalobills.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0750",
        "abbr": "CAR",
        "cityState": "Carolina",
        "fullName": "Carolina Panthers",
        "nick": "Panthers",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCS",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0020", "abbr": "NCS", "fullName": "NFC South Division"},
        "yearFound": 1995,
        "stadiumName": "Bank of America Stadium",
        "ticketPhoneNumber": "800-745-3000",
        "teamSiteUrl": "http://www.panthers.com/",
        "teamSiteTicketUrl": "http://www.panthers.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0810",
        "abbr": "CHI",
        "cityState": "Chicago",
        "fullName": "Chicago Bears",
        "nick": "Bears",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCN",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0017", "abbr": "NCN", "fullName": "NFC North Division"},
        "yearFound": 1920,
        "stadiumName": "Soldier Field",
        "ticketPhoneNumber": "888-79-BEARS",
        "teamSiteUrl": "http://www.chicagobears.com/",
        "teamSiteTicketUrl": "http://www.chicagobears.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "0920",
        "abbr": "CIN",
        "cityState": "Cincinnati",
        "fullName": "Cincinnati Bengals",
        "nick": "Bengals",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACN",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0013", "abbr": "ACN", "fullName": "AFC North Division"},
        "yearFound": 1968,
        "stadiumName": "Paul Brown Stadium",
        "ticketPhoneNumber": "866-621-TDTD (8383)",
        "teamSiteUrl": "http://www.bengals.com/",
        "teamSiteTicketUrl": "http://www.bengals.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "1050",
        "abbr": "CLE",
        "cityState": "Cleveland",
        "fullName": "Cleveland Browns",
        "nick": "Browns",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACN",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0013", "abbr": "ACN", "fullName": "AFC North Division"},
        "yearFound": 1946,
        "stadiumName": "FirstEnergy Stadium",
        "ticketPhoneNumber": "440-824-3434",
        "teamSiteUrl": "http://www.clevelandbrowns.com/",
        "teamSiteTicketUrl": "http://www.clevelandbrowns.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "1200",
        "abbr": "DAL",
        "cityState": "Dallas",
        "fullName": "Dallas Cowboys",
        "nick": "Cowboys",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCE",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0016", "abbr": "NCE", "fullName": "NFC East Division"},
        "yearFound": 1960,
        "stadiumName": "AT&T Stadium",
        "ticketPhoneNumber": "817-892-5000",
        "teamSiteUrl": "http://www.dallascowboys.com/",
        "teamSiteTicketUrl": "http://www.dallascowboys.com/tickets/index.html"
      }, {
        "season": 2017,
        "teamId": "1400",
        "abbr": "DEN",
        "cityState": "Denver",
        "fullName": "Denver Broncos",
        "nick": "Broncos",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACW",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0014", "abbr": "ACW", "fullName": "AFC West Division"},
        "yearFound": 1960,
        "stadiumName": "Sports Authority Field at Mile High",
        "ticketPhoneNumber": "720-258-3333",
        "teamSiteUrl": "http://www.denverbroncos.com/",
        "teamSiteTicketUrl": "http://www.denverbroncos.com/ticketOffice"
      }, {
        "season": 2017,
        "teamId": "1540",
        "abbr": "DET",
        "cityState": "Detroit",
        "fullName": "Detroit Lions",
        "nick": "Lions",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCN",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0017", "abbr": "NCN", "fullName": "NFC North Division"},
        "yearFound": 1930,
        "stadiumName": "Ford Field",
        "ticketPhoneNumber": "313-262-2011",
        "teamSiteUrl": "http://www.detroitlions.com/",
        "teamSiteTicketUrl": "http://www.detroitlions.com/tickets/index.html"
      }, {
        "season": 2017,
        "teamId": "1800",
        "abbr": "GB",
        "cityState": "Green Bay",
        "fullName": "Green Bay Packers",
        "nick": "Packers",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCN",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0017", "abbr": "NCN", "fullName": "NFC North Division"},
        "yearFound": 1921,
        "stadiumName": "Lambeau Field",
        "ticketPhoneNumber": "920-569-7501",
        "teamSiteUrl": "http://www.packers.com/",
        "teamSiteTicketUrl": "http://www.packers.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "2120",
        "abbr": "HOU",
        "cityState": "Houston",
        "fullName": "Houston Texans",
        "nick": "Texans",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACS",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0019", "abbr": "ACS", "fullName": "AFC South Division"},
        "yearFound": 2002,
        "stadiumName": "NRG Stadium",
        "ticketPhoneNumber": "832-667-2390",
        "teamSiteUrl": "http://www.houstontexans.com/",
        "teamSiteTicketUrl": "http://www.houstontexans.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "2200",
        "abbr": "IND",
        "cityState": "Indianapolis",
        "fullName": "Indianapolis Colts",
        "nick": "Colts",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACS",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0019", "abbr": "ACS", "fullName": "AFC South Division"},
        "yearFound": 1944,
        "stadiumName": "Lucas Oil Stadium",
        "ticketPhoneNumber": "800-745-3000",
        "teamSiteUrl": "http://www.colts.com/",
        "teamSiteTicketUrl": "http://www.colts.com/tickets-and-stadium/index.html"
      }, {
        "season": 2017,
        "teamId": "2250",
        "abbr": "JAX",
        "cityState": "Jacksonville",
        "fullName": "Jacksonville Jaguars",
        "nick": "Jaguars",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACS",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0019", "abbr": "ACS", "fullName": "AFC South Division"},
        "yearFound": 1995,
        "stadiumName": "EverBank Field",
        "ticketPhoneNumber": "904-633-2000",
        "teamSiteUrl": "http://www.jaguars.com/",
        "teamSiteTicketUrl": "http://prod.www.jaguars.clubs.nfl.com/tickets/index.html"
      }, {
        "season": 2017,
        "teamId": "2310",
        "abbr": "KC",
        "cityState": "Kansas City",
        "fullName": "Kansas City Chiefs",
        "nick": "Chiefs",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACW",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0014", "abbr": "ACW", "fullName": "AFC West Division"},
        "yearFound": 1960,
        "stadiumName": "Arrowhead Stadium",
        "ticketPhoneNumber": "816-920-9300",
        "teamSiteUrl": "http://www.kcchiefs.com/",
        "teamSiteTicketUrl": "http://www.kcchiefs.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "2510",
        "abbr": "LA",
        "cityState": "Los Angeles Rams",
        "fullName": "Los Angeles Rams",
        "nick": "Rams",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCW",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0018", "abbr": "NCW", "fullName": "NFC West Division"},
        "yearFound": 1937,
        "stadiumName": "Los Angeles Memorial Coliseum",
        "ticketPhoneNumber": "314-425-8830",
        "teamSiteUrl": "http://www.therams.com/",
        "teamSiteTicketUrl": "http://welcomehomerams.com/"
      }, {
        "season": 2017,
        "teamId": "4400",
        "abbr": "LAC",
        "cityState": "Los Angeles Chargers",
        "fullName": "Los Angeles Chargers",
        "nick": "Chargers",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACW",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0014", "abbr": "ACW", "fullName": "AFC West Division"},
        "yearFound": 1960,
        "stadiumName": "StubHub Center",
        "ticketPhoneNumber": "1-800-745-3000",
        "teamSiteUrl": "http://www.chargers.com/",
        "teamSiteTicketUrl": "http://www.chargers.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "2700",
        "abbr": "MIA",
        "cityState": "Miami",
        "fullName": "Miami Dolphins",
        "nick": "Dolphins",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACE",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0012", "abbr": "ACE", "fullName": "AFC East Division"},
        "yearFound": 1966,
        "stadiumName": "Hard Rock Stadium",
        "ticketPhoneNumber": "888-FINS-TIX",
        "teamSiteUrl": "http://www.miamidolphins.com/",
        "teamSiteTicketUrl": "http://www.miamidolphins.com/tickets-and-stadium/index.html"
      }, {
        "season": 2017,
        "teamId": "3000",
        "abbr": "MIN",
        "cityState": "Minnesota",
        "fullName": "Minnesota Vikings",
        "nick": "Vikings",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCN",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0017", "abbr": "NCN", "fullName": "NFC North Division"},
        "yearFound": 1961,
        "stadiumName": "U.S. Bank Stadium",
        "ticketPhoneNumber": "612-33-VIKES (84537)",
        "teamSiteUrl": "http://www.vikings.com/",
        "teamSiteTicketUrl": "http://www.vikings.com/tickets/index.html"
      }, {
        "season": 2017,
        "teamId": "3200",
        "abbr": "NE",
        "cityState": "New England",
        "fullName": "New England Patriots",
        "nick": "Patriots",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACE",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0012", "abbr": "ACE", "fullName": "AFC East Division"},
        "yearFound": 1960,
        "stadiumName": "Gillette Stadium",
        "ticketPhoneNumber": "800-543-1776",
        "teamSiteUrl": "http://www.patriots.com/",
        "teamSiteTicketUrl": "http://www.patriots.com/stadium/index.cfm?ac=TicketSales"
      }, {
        "season": 2017,
        "teamId": "3300",
        "abbr": "NO",
        "cityState": "New Orleans",
        "fullName": "New Orleans Saints",
        "nick": "Saints",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCS",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0020", "abbr": "NCS", "fullName": "NFC South Division"},
        "yearFound": 1967,
        "stadiumName": "Mercedes-Benz Superdome",
        "ticketPhoneNumber": "504-731-1700",
        "teamSiteUrl": "http://www.neworleanssaints.com/",
        "teamSiteTicketUrl": "http://www.neworleanssaints.com/tickets-and-stadium/index.html"
      }, {
        "season": 2017,
        "teamId": "3410",
        "abbr": "NYG",
        "cityState": "New York Giants",
        "fullName": "New York Giants",
        "nick": "Giants",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCE",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0016", "abbr": "NCE", "fullName": "NFC East Division"},
        "yearFound": 1925,
        "stadiumName": "MetLife Stadium",
        "ticketPhoneNumber": "201-935-8111",
        "teamSiteUrl": "http://www.giants.com/",
        "teamSiteTicketUrl": "http://www.giants.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "3430",
        "abbr": "NYJ",
        "cityState": "New York Jets",
        "fullName": "New York Jets",
        "nick": "Jets",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACE",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0012", "abbr": "ACE", "fullName": "AFC East Division"},
        "yearFound": 1960,
        "stadiumName": "MetLife Stadium",
        "ticketPhoneNumber": "800-469-JETS (5387)",
        "teamSiteUrl": "http://www.newyorkjets.com/",
        "teamSiteTicketUrl": "http://www.newyorkjets.com/tickets-and-stadium/index.html"
      }, {
        "season": 2017,
        "teamId": "2520",
        "abbr": "OAK",
        "cityState": "Oakland",
        "fullName": "Oakland Raiders",
        "nick": "Raiders",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACW",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0014", "abbr": "ACW", "fullName": "AFC West Division"},
        "yearFound": 1960,
        "stadiumName": "Oakland Coliseum",
        "ticketPhoneNumber": "800-724-3377",
        "teamSiteUrl": "http://www.raiders.com/",
        "teamSiteTicketUrl": "http://www.raiders.com/Tickets/"
      }, {
        "season": 2017,
        "teamId": "3700",
        "abbr": "PHI",
        "cityState": "Philadelphia",
        "fullName": "Philadelphia Eagles",
        "nick": "Eagles",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCE",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0016", "abbr": "NCE", "fullName": "NFC East Division"},
        "yearFound": 1933,
        "stadiumName": "Lincoln Financial Field",
        "ticketPhoneNumber": "215-463-5500",
        "teamSiteUrl": "http://www.philadelphiaeagles.com/",
        "teamSiteTicketUrl": "http://www.philadelphiaeagles.com/tickets/index.html"
      }, {
        "season": 2017,
        "teamId": "3900",
        "abbr": "PIT",
        "cityState": "Pittsburgh",
        "fullName": "Pittsburgh Steelers",
        "nick": "Steelers",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACN",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0013", "abbr": "ACN", "fullName": "AFC North Division"},
        "yearFound": 1933,
        "stadiumName": "Heinz Field",
        "ticketPhoneNumber": "412-323-1200",
        "teamSiteUrl": "http://www.steelers.com/",
        "teamSiteTicketUrl": "http://www.steelers.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "4600",
        "abbr": "SEA",
        "cityState": "Seattle",
        "fullName": "Seattle Seahawks",
        "nick": "Seahawks",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCW",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0018", "abbr": "NCW", "fullName": "NFC West Division"},
        "yearFound": 1976,
        "stadiumName": "CenturyLink Field",
        "ticketPhoneNumber": "888-NFL-HAWK",
        "teamSiteUrl": "http://www.seahawks.com/",
        "teamSiteTicketUrl": "http://www.seahawks.com/Tickets/Tickets.aspx?id=49670"
      }, {
        "season": 2017,
        "teamId": "4500",
        "abbr": "SF",
        "cityState": "San Francisco",
        "fullName": "San Francisco 49ers",
        "nick": "49ers",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCW",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0018", "abbr": "NCW", "fullName": "NFC West Division"},
        "yearFound": 1946,
        "stadiumName": "Levi's® Stadium",
        "ticketPhoneNumber": "415-GO-49ERS",
        "teamSiteUrl": "http://www.sf49ers.com/",
        "teamSiteTicketUrl": "http://www.sf49ers.com/tickets/single.php?section=TI%20Single"
      }, {
        "season": 2017,
        "teamId": "4900",
        "abbr": "TB",
        "cityState": "Tampa Bay",
        "fullName": "Tampa Bay Buccaneers",
        "nick": "Buccaneers",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCS",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0020", "abbr": "NCS", "fullName": "NFC South Division"},
        "yearFound": 1976,
        "stadiumName": "Raymond James Stadium",
        "ticketPhoneNumber": "813-879-2827",
        "teamSiteUrl": "http://www.buccaneers.com/",
        "teamSiteTicketUrl": "http://www.buccaneers.com/tickets/gametickets.aspx"
      }, {
        "season": 2017,
        "teamId": "2100",
        "abbr": "TEN",
        "cityState": "Tennessee",
        "fullName": "Tennessee Titans",
        "nick": "Titans",
        "teamType": "TEAM",
        "conferenceAbbr": "AFC",
        "divisionAbbr": "ACS",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "division": {"id": "0019", "abbr": "ACS", "fullName": "AFC South Division"},
        "yearFound": 1960,
        "stadiumName": "Nissan Stadium",
        "ticketPhoneNumber": "615-565-4200",
        "teamSiteUrl": "http://www.titansonline.com/",
        "teamSiteTicketUrl": "http://www.titansonline.com/stadium/tickets/index.php"
      }, {
        "season": 2017,
        "teamId": "5110",
        "abbr": "WAS",
        "cityState": "Washington",
        "fullName": "Washington Redskins",
        "nick": "Redskins",
        "teamType": "TEAM",
        "conferenceAbbr": "NFC",
        "divisionAbbr": "NCE",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "division": {"id": "0016", "abbr": "NCE", "fullName": "NFC East Division"},
        "yearFound": 1932,
        "stadiumName": "FedExField",
        "ticketPhoneNumber": "301-276-6800",
        "teamSiteUrl": "http://www.redskins.com/",
        "teamSiteTicketUrl": "http://www.redskins.com/tickets/"
      }, {
        "season": 2017,
        "teamId": "8600",
        "abbr": "AFC",
        "cityState": "AFC Pro Bowl",
        "fullName": "AFC Pro Bowl Team",
        "nick": "AFC Pro Bowl",
        "teamType": "PRO",
        "conferenceAbbr": "AFC",
        "conference": {"id": "0011", "abbr": "AFC", "fullName": "American Football Conference"},
        "yearFound": 2018,
        "stadiumName": "Camping World Stadium"
      }, {
        "season": 2017,
        "teamId": "8700",
        "abbr": "NFC",
        "cityState": "NFC Pro Bowl",
        "fullName": "NFC Pro Bowl Team",
        "nick": "NFC Pro Bowl",
        "teamType": "PRO",
        "conferenceAbbr": "NFC",
        "conference": {"id": "0015", "abbr": "NFC", "fullName": "National Football Conference"},
        "yearFound": 2018,
        "stadiumName": "Camping World Stadium"
      }
    ];
    var team = teams.find(function(team){
      return team.nick === teamObj.nick;
    });

    if(!team){
      return;
    }

    [
      'nick',
      'abbr',
      'teamId',
      'cityState',
      'conferenceAbbr',
      'divisionAbbr'
    ].forEach(function(key){
      teamObj[key] = team[key];
    });


  }

  return results;
}
