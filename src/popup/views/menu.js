var MenuView = MenuBaseView.extend({
  initialize: function () {
    MenuBaseView.prototype.initialize.call(this);
    this.listenTo(scriptsMenu, 'reset', this.render);
    this.listenTo(commandsMenu, 'reset', this.render);
  },
  _render: function () {
    var _this = this;
    _this.$el.html(_this.templateFn({
      hasSep: !!scriptsMenu.length
    }));
    var comp = _this.components();
    var top = comp.top;
    var bot = comp.bot;
    _this.addMenuItem({
      name: _.i18n('menuManageScripts'),
      symbol: 'fa-cog',
      onClick: function (e) {
        var url = chrome.extension.getURL(chrome.app.getDetails().options_page);
        chrome.tabs.query({
          currentWindow: true,
          url: url,
        }, function (tabs) {
          var tab = _.find(tabs, function (tab) {
            var hash = tab.url.match(/#(\w+)/);
            return !hash || !_.includes(['confirm'], hash[1]);
          });
          if (tab) chrome.tabs.update(tab.id, {active: true});
          else chrome.tabs.create({url: url});
        });
      },
    }, top);
    if (app.currentTab && /^https?:\/\//i.test(app.currentTab.url))
      _this.addMenuItem({
        name: _.i18n('menuFindScripts'),
        symbol: 'fa-search',
        onClick: function (e) {
          var matches = app.currentTab.url.match(/:\/\/(?:www\.)?([^\/]*)/);
          chrome.tabs.create({
            url: 'https://greasyfork.org/scripts/search?q=' + matches[1],
          });
        },
      }, top);
    if (commandsMenu.length) _this.addMenuItem({
      name: _.i18n('menuCommands'),
      symbol: 'fa-arrow-right',
      onClick: function (e) {
        app.navigate('commands', {trigger: true});
      },
    }, top);
    _this.addMenuItem({
      name: _.i18n('menuScriptEnabled'),
      data: _.options.get('isApplied'),
      symbol: function (data) {
        return data ? 'fa-check' : 'fa-times';
      },
      onClick: function (e, model) {
        var isApplied = !model.get('data');
        _.options.set('isApplied', isApplied);
        model.set({data: isApplied});
        chrome.browserAction.setIcon({
          path: {
            19: '/images/icon19' + (isApplied ? '' : 'w') + '.png',
            38: '/images/icon38' + (isApplied ? '' : 'w') + '.png'
          },
        });
      },
    }, top);
    scriptsMenu.each(function (item) {
      _this.addMenuItem(item, bot);
    });
    setTimeout(function () {
      _this.fixStyles(bot, comp.plh);
    });
  },
});