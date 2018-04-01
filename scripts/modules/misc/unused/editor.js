sync.render("ui_editor", function(obj, data, scope) {
  var div = $("<div>");

  var navBar = genNavBar();
  navBar.appendTo(div);
  navBar.generateTab("Character Sheet", "", function(parent) {
    var row = $("<div>").appendTo(parent);
    row.addClass("flexrow");

    var editor = $("<div>").appendTo(row);
    editor.css("width", "50%");

    var textArea = $("<textarea>").appendTo(editor);
    textArea.css("width", "100%");
    textArea.css("height", "100%");
    textArea.val(JSON.stringify(obj.data.sheet));

    var preview = $("<div>").appendTo(row);
    preview.css("width", "50%");

    var dummy = sync.dummyObj();
    dummy.data = duplicate(game.templates.character);
    for (var i in dummy.data.stats) {

      dummy.data.stats[i].current = 16;
    }

    sync.render("ui_fakeSheet")(dummy, preview, {viewOnly : true, sheet : obj.data.sheet}).appendTo(preview);
  });
  navBar.selectTab("Character Sheet");

  navBar.generateTab("Character Data", "", function(parent) {
    var row = $("<div>").appendTo(parent);
    row.addClass("flexrow");

    var editor = $("<div>").appendTo(row);
    editor.css("width", "50%");

    var preview = $("<div>").appendTo(row);
    preview.css("width", "50%");
  });

  navBar.generateTab("Character Summary", "", function(parent) {
    var row = $("<div>").appendTo(parent);
    row.addClass("flexrow");

    var editor = $("<div>").appendTo(row);
    editor.css("width", "50%");

    var preview = $("<div>").appendTo(row);
    preview.css("width", "50%");
  });

  return div;
});

sync.render("ui_genEditor", function(obj, data, scope) {
  var div = $("<div>");
  var data = obj.data;
  obj.data.template = obj.data.template || {name : "[No Name]", choices : []};
  obj.data.options = obj.data.options || {};

  function newChoiceUI(state, depth, section) {
    var body = $("<div>"); // this is where the names go
    body.css("font-size", Math.max(22 - depth*2, 11));

    var containerT = $("<div>").appendTo(body);
    containerT.addClass("flexrow fit-x");

    var margin = $("<div>").appendTo(containerT);
    margin.addClass("secondary");
    margin.css("width", 15*depth+"px");

    var nonmargin = $("<div>").appendTo(containerT);
    nonmargin.addClass("flexbetween fit-x flex");
    nonmargin.css("border", "1px solid black")

    var container = $("<div>").appendTo(nonmargin);
    container.addClass("flexmiddle");
    container.css("width", "auto");
    if (!scope.viewOnly) {
      if (section) {
        var newChoice = genIcon("plus", "New Sub-Category").appendTo(container);
        newChoice.addClass("outline focus flex");
        newChoice.css("padding", "4px");
        newChoice.click(function(){
          var arr = state.split(".");
          var lookup = "";
          for (var i=0; i<arr.length; i++) {
            lookup += "choices." + arr[i] + ".";
          }
          var ref = sync.traverse(data.template, lookup.substring(0, lookup.length-1));
          function cb(entry) {
            ref.choices.push(entry);
            obj.update();
          }
          newEntry(ref, null, true, cb);
        });
      }
      else {
        var namePlate = genIcon("plus", "New Choice").appendTo(container);
        namePlate.click(function(){
          var arr = state.split(".");
          var lookup = "";
          for (var i in arr) {
            lookup += "choices."+arr[i] + ".";
          }
          var ref = sync.traverse(data.template, lookup.substring(0, lookup.length-1));
          function cb(entry) {
            ref.choices.push(entry);
            obj.update();
          }
          newEntry(ref, null, null, cb);
        });
      }
    }

    return body;
  }

  function buildUI(choice, state, depth, parent) {
    var body = $("<div>"); // this is where the names go
    body.css("font-size", Math.max(22 - depth*2, 11));

    var containerT = $("<div>").appendTo(body);
    containerT.addClass("flexrow fit-x");

    var margin = $("<div>").appendTo(containerT);
    margin.addClass("secondary");
    margin.css("width", 15*depth+"px");

    var nonmargin = $("<div>").appendTo(containerT);
    nonmargin.addClass("flexbetween fit-x flex");

    var container = $("<div>").appendTo(nonmargin);
    container.addClass("flexmiddle");
    container.css("width", "auto");

    var namePlate = $("<b>").appendTo(container);
    namePlate.text(choice.name);

    if (choice.tip) {
      var icon = genIcon("info-sign").appendTo(namePlate);
      icon.attr("tip", choice.tip);
      icon.css("padding-left", "10px");
      icon.click(function(ev) {
        if ($("#template-hint").length > 0) {
          layout.coverlay($("#template-hint"));
        }
        else {
          var popFrame = ui_popOut({
            target: $(this),
            id: "template-hint",
            hideclose : true,
            align : "top",
            style: {"z-index": 2000}
          }, $("<p style='text-align:center; margin: 0;'>"+$(this).attr("tip")+"</p>"));
        }
        ev.stopPropagation();
        return false;
      });
    }

    if (choice.data && depth != 0) {
      if (!scope.viewOnly) {
        var edit = genIcon("pencil").appendTo(container);
        edit.click(function(){
          var arr = state.split(".");
          var lookup = "";
          var secondLookup = "";
          for (var i=0; i<arr.length; i++) {
            lookup += "choices." + arr[i] + ".";
            if (i < arr.length) {
              secondLookup += "choices." + arr[i] + ".";
            }
          }
          var ref = sync.traverse(data.template, lookup.substring(0, lookup.length-1));
          var ref2 = sync.traverse(data.template, secondLookup.substring(0, secondLookup.length-1));
          var index = arr[arr.length-1];
          function cb(entry, del) {
            if (del) {
              ref2.choices.splice(index);
            }
            else {
              ref.name = entry.name;
              ref.tip = entry.tip;
              ref.data = entry.data;
              ref.number = entry.number;
              ref.exclusive = entry.exclusive;
            }
            obj.update();
          }
          newEntry(ref, true, null, cb);
        });
      }

      containerT.attr("title", "Right Click for details");
      containerT.contextmenu(function(ev){
        var content = $("<div>");
        content.addClass("flexcolumn subtitle lpadding");
        content.css("text-align", "left");
        content.append("<i>This choice gives you<i>");
        var reg = /(traits|counters|talents|feats|inventory|gear|equipment|skills|stats|info|spells|spellbook|spellslots|psychic|aptitudes|apts|proficiency|other|description|notes|specials|proficiencies|proficient)\s*[-|:|=|;]\s*/ig
        var cleanup = replaceAll(replaceAll(choice.data.trim(), "\t", ""), "\n", "<br>");
        var arr = cleanup.match(reg);
        for (var i=0; i<arr.length; i++) {
          cleanup = cleanup.replace(arr[i], "<b style='font-size : 1.5em; font-family : bolsterbold'>"+arr[i].substring(0,arr[i].length-2)+"</b>");
        }
        content.append("<p>"+cleanup+"</p>");
        content.css("max-height", "25vh");
        content.css("overflow-y", "auto");

        ui_popOut({
          target : $(this),
          align : "right",
          id : "option-preview"
        }, content);

        ev.stopPropagation();
        return false;
      });
      nonmargin.addClass("outlinebottom");
      namePlate.css("font-weight", "normal");
      container.css("padding-left", "4px");

      nonmargin.addClass("hover2");
      nonmargin.css("cursor", "pointer");

      var check = genInput({
        type : "checkbox",
        state : state,
        data : choice.data,
        style : {"margin" : "0", "width" : "12px", "height" : "12px"},
      });
      namePlate.before(check);
      if (parent.cData.number && !parent.cData.exclusive) {
        for (var i=0; i<parent.cData.number-1; i++) {
          var check = genInput({
            type : "checkbox",
            state : state,
            data : choice.data,
            style : {"margin" : "0", "width" : "12px", "height" : "12px"},
          });
          namePlate.before(check);
        }
      }
    }
    else {
      if (depth < 2) {
        nonmargin.addClass("highlight2");
      }
      else {
        nonmargin.addClass("highlight");
      }
      nonmargin.css("text-shadow", "0 0 0.25em black")
      nonmargin.css("border", "1px solid black")
      nonmargin.css("color", "white");
      nonmargin.css("padding", "4px");

      if (choice.exclusive && choice.number) {
        namePlate.text(namePlate.text() + " ("+choice.number+")")
      }
      if (!choice.exclusive && choice.number) {
        namePlate.text(namePlate.text() + " ["+choice.number+"]")
      }
      if (!scope.viewOnly) {
        var edit = genIcon("pencil").appendTo(container);
        edit.click(function(){
          var arr = state.split(".");
          var lookup = "";
          var secondLookup = "";
          for (var i=0; i<arr.length; i++) {
            lookup += "choices." + arr[i] + ".";
            if (i < arr.length-1) {
              secondLookup += "choices." + arr[i] + ".";
            }
          }
          var ref = sync.traverse(data.template, lookup.substring(0, lookup.length-1));
          var ref2 = sync.traverse(data.template, secondLookup.substring(0, secondLookup.length-1));
          var index = arr[arr.length-1];
          function cb(entry, del) {
            if (del) {
              ref2.choices.splice(index);
            }
            else {
              ref.name = entry.name;
              ref.tip = entry.tip;
              ref.number = entry.number;
              ref.exclusive = entry.exclusive;
            }
            obj.update();
          }
          newEntry(ref, {target : ref2, index : index}, true, cb);
        });
      }
    }

    if (!choice.data) {
      newChoiceUI(state, depth+1).appendTo(body);
    }
    for (var index in choice.choices) {
      var nextChoice = choice.choices[index];
      if ((nextChoice.choices || nextChoice.data)) {
        var show = true;
        var number = 0;
        var ui = buildUI(nextChoice, state+"."+index, depth+1, {cData : choice, left : choice.number-number}).appendTo(body);
        if (nextChoice.data) {
          newChoiceUI(state+"."+index, depth+2, true).appendTo(body);
        }
      }
    }

    return body;
  }

  if (!scope.viewOnly) {
    var editorOptions = $("<div>").appendTo(div);
    editorOptions.addClass("flexaround");

    var icon = genIcon("plus", "Add Section").appendTo(editorOptions);
    icon.click(function(){
      function cb(entry, del) {
        obj.data.template.choices.push(entry);
        obj.update();
      }

      newEntry(obj.data.template, false, true, cb);
    });

    var icon = genIcon("pencil", "Rename").appendTo(editorOptions);
    icon.click(function(){
      ui_prompt({
        target : $(this),
        id : "rename-template",
        inputs : {
          "Name" : ""
        },
        click : function(ui, inputs) {
          obj.data.template.name = inputs["Name"].val();
          obj.update();
        }
      });
    });

    var icon = genIcon("trash", "Clear").appendTo(editorOptions);
    icon.click(function(){
      obj.data.template = {name : "[No Name]", choices : []};
    });
  }

  function newEntry(target, edit, section, callback){
    var options = $("<div>");
    options.addClass("flexcolumn");

    options.append("<b>Name</b>");
    var name = genInput({
      parent : options,
    });
    options.append("<b>Tip</b>");
    var tip = genInput({
      parent : options,
    });
    var text;
    var number;
    var stacking;

    if (edit) {
      name.val(target.name);
      tip.val(target.tip);
    }

    if (!section) {
      options.append("<b>Character Data</b>");

      text = $("<textarea>").appendTo(options);
      text.attr("placeholder", "Use the same rules as the importer");
      text.css("width", "30vw");
      text.css("height", "15vh");
      text.css("resize", "both");
      if (edit) {
        text.val(target.data);
      }
    }
    else {
      options.append("<b>Sub-Choices</b>");
      var choiceWrap = $("<div>").appendTo(options);
      choiceWrap.addClass("flexrow subtitle");

      var choiceWrap = $("<div>").appendTo(options);
      choiceWrap.addClass("flexrow flexaround lrpadding subtitle");

      number = genInput({
        parent : choiceWrap,
        type : "number",
        placeholder : "# of Selections",
        value : 1,
        min : 1,
        style : {"width" : "75px"}
      });

      var checkWrap = $("<div>").appendTo(choiceWrap);
      checkWrap.addClass("flexmiddle");
      stacking = genInput({
        parent : checkWrap,
        type : "checkbox",
        style : {"margin-top" : "0px"}
      });
      if (edit) {
        number.val(target.number || 1);
        stacking.prop("checked", !target.exclusive);
      }
      checkWrap.append("<b>Choice Stacking</b>");
    }
    var buttonOptions = $("<div>").appendTo(options);
    buttonOptions.addClass("fit-x flexrow");

    var button = $("<button>").appendTo(buttonOptions);
    button.addClass("flex");
    button.append("Confirm");
    button.click(function(){
      var entry = {
        name : name.val() || "[No Name]",
        tip : tip.val(),
        choices : [],
        exclusive : true,
      };
      if (section) {
        if (number.val() > 1) {
          entry.number = number.val();
          if (stacking.prop("checked") == true) {
            entry.exclusive = false;
          }
        }
      }
      else {
        entry.data = text.val() || "INFO-\n";
      }
      callback(entry);
      layout.coverlay("new-section");
    });
    if (edit) {
      var button = $("<button>").appendTo(buttonOptions);
      button.addClass("focus");
      button.append("Delete");
      button.click(function(){
        callback(null, true);
        layout.coverlay("new-section");
      });
    }
    var pop = ui_popOut({
      target : icon,
      id : "new-section",
    }, options);
  }

  var title = $("<b>").appendTo(div);
  title.addClass("flexmiddle");
  title.append(data.template.name);
  title.css("font-size", "1.5em");

  var choiceColumn = $("<div>").appendTo(div);
  choiceColumn.addClass("flexrow flexaround flex");
  choiceColumn.css("overflow", "auto");
  /*choiceColumn.scroll(function() {
    app.attr("_lastScrollTop_opt", $(this).scrollTop());
  });*/
  for (var i in data.template.choices) {
    var category = data.template.choices[i]; // each one gets a column
    var choiceList = $("<div>").css("display", "inline-block").appendTo(choiceColumn);
    buildUI(category, i, 0).addClass("outline").appendTo(choiceList);
  }

  return div;
});


function openEditor(){
  var frame = layout.page({title: "Build", blur: 0.5, id : "action-join-combat", width : "90%"});
  game.locals["editor"] = sync.obj();
  game.locals["editor"].data = {sheet : duplicate(game.templates.display.sheet), item : duplicate(game.templates.display.item)};

  frame.append(sync.render("ui_editor")(game.locals["editor"], frame, {}));
}


function openGenEditor(){
  var frame = layout.page({title: "Build", blur: 0.5, id : "action-join-combat", width : "90%"});
  game.locals["genEditor"] = sync.obj();
  game.locals["genEditor"].data = {template : {name : "Test", choices : []}, options : {free : true, all : true}};

  var newApp = sync.newApp("ui_genEditor");
  newApp.appendTo(frame);
  game.locals["genEditor"].addApp(newApp);
}

sync.render("ui_fakeSummary", function(obj, app, scope) {
  if (!obj) {
    return $("<div>");
  }
  var data = obj.data;
  var info = data.info;
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), displayMode : parseInt(app.attr("displayMode") || 0)};

  var sheet = scope.sheet || game.templates.display.sheet;
  var vehicle = scope.vehicle || game.templates.display.vehicle;

  var div = $("<div>");
  div.addClass("flexcolumn outline");

  var namePlate = $("<div>").appendTo(div);
  namePlate.addClass("flexbetween");

  var img = $("<img>").appendTo(namePlate);
  img.attr("src" , (sync.val(info.img) || "/content/icons/blankchar.png"));
  img.css("width", scope.width || "auto");
  img.css("height", scope.height || "30px");

  var name = $("<b>").appendTo(namePlate);
  name.addClass("flexmiddle");
  name.text(sync.val(info.name));
  if (scope.hide) {
    img.attr("src" , "/content/icons/blankchar.png");
    name.text("(Hidden)");
    if (hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
      name.text(sync.val(info.name)+" (Hidden)");
    }
    else {
      name.text("(Hidden)");
    }
  }
  if (scope.minimized) {return div;}

  if (!scope.viewOnly) {
    var optionsBack = $("<div>").appendTo(div);
    optionsBack.addClass("alttext background outline");

    var optionsBar = $("<div>").appendTo(optionsBack);
    optionsBar.addClass("flexwrap");

    var security = genIcon("lock");
    security.attr("title", "Edit who has access to this character");
    security.appendTo(optionsBar);
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "top",
        id : "ui-rights-dialog",
      }, content);
    });

    if (hasSecurity(getCookie("UserID"), "Rights", data)) {
      var icon = genIcon("heart");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+obj.data.counters[sheet.altStat].name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : 1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });

      var icon = genIcon("cog");
      icon.css("margin-left", "8px");
      icon.attr("title", "Actions");
      icon.appendTo(optionsBar);
      icon.click(function() {
        var iconRef = $(this);
        var commands = [];
        for (var key in _actions) {
          if (!_actions[key].condition || _actions[key].condition(obj)) {
            commands.push(
              {name : _actions[key].name || key,
                attr : {key : key},
                click : function(ev, ui){
                  if (_actions[ui.attr("key")].click) {
                    _actions[ui.attr("key")].click(ev, iconRef, obj, app, scope);
                    //sendAlert({text : "Action Executed"});
                  }
                }
              }
            );
          }
        }
        ui_dropMenu($(this), commands, {id : "c-actions"});
      });

      var icon = genIcon("heart-empty");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+obj.data.counters[sheet.altStat].name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : -1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });

      for (var i in sheet.summary) {
        var tabData = sheet.summary[i];
        var tab = genIcon(tabData.icon).appendTo(optionsBar);
        tab.attr("title", tabData.name);
        tab.css("margin-left", "8px");
        tab.attr("index", i);
        tab.click(function(){
          if ($(this).attr("index") < 0) {
            app.attr("displayMode", sheet.summary.length-1);
          }
          else if ($(this).attr("index") >= sheet.summary.length) {
            app.attr("displayMode", 0);
          }
          else {
            app.attr("displayMode", $(this).attr("index"));
          }
          obj.update();
        });
      }

      var expand = genIcon("new-window").appendTo(optionsBar);
      expand.css("margin-left", "8px");
      expand.click(function(){
        app.attr("from", app.attr("ui-name"));
        app.attr("ui-name", "ui_characterSheet");
        app.css("max-width", assetTypes["c"].width);
        app.css("max-height", assetTypes["c"].height);
        obj.update();
      });
    }
  }

  var infoPanel = $("<div>").appendTo(div);
  infoPanel.addClass("flexcolumn");
  if (sheet.summary[scope.displayMode]) {
    var newScope = duplicate(scope);
    newScope.display = sheet.summary[scope.displayMode].display;
    newScope.markup = "summary";
    infoPanel.append(sync.render("ui_processUI")(obj, app, newScope));
  }

  return div;
});

sync.render("ui_fakeVehicle", function(obj, app, scope) {
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    displayMode : parseInt(app.attr("displayMode") || 0),
    editable: (app.attr("editable") == "true")
  };
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn outline");

  var sheet = scope.sheet || game.templates.display.vehicle;
  for (var i in sheet.style) {
    div.css(i, sheet.style[i]);
  }

  if (!scope.viewOnly) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
    		var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Create</b>");
      }
  	});
    div.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer;
      if (dt.getData("Text").match("{")) {
        var ent = JSON.parse(dt.getData("Text"));
        if (ent._t == "i") {
          if (!dt.getData("spell")) {
            obj.data.inventory.push(ent);
            obj.sync("updateAsset");
          }
        }
      }

      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

  	div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
  	});
  }

  var optionsBack = $("<div>").appendTo(div);
  optionsBack.addClass("alttext background outline");

  var optionsBar = $("<div>").appendTo(optionsBack);
  optionsBar.addClass("flexwrap");
  if (!scope.viewOnly) {
    var security = genIcon("lock");
    security.attr("title", "Edit who has access to this character");
    security.appendTo(optionsBar);
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "top",
        id : "ui-rights-dialog",
      }, content);
    });


    if (hasSecurity(getCookie("UserID"), "Rights", data)) {
      var icon = genIcon("heart");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+obj.data.counters[sheet.altStat].name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : 1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });

      var icon = genIcon("heart-empty");
      icon.css("margin-left", "8px");
      icon.attr("title", "Change wounds");
      if (sheet.altStat) {
        icon.attr("title", "Change wounds, ctrl for "+obj.data.counters[sheet.altStat].name);
      }
      icon.appendTo(optionsBar);
      icon.click(function(e) {
        var target = sync.traverse(obj.data, sheet.health || "counters.wounds");

        if (e.ctrlKey && sheet.altStat) {
         target = sync.traverse(obj.data, sheet.altStat);
        }
        var text = {};
        text[(target.name + " Amount")] = {type : "number", value : -1};
        ui_prompt({
          target : $(this),
          inputs : text,
          click : function(ev, inputs) {
            sync.val(target, sync.rawVal(target)+parseInt(inputs[(target.name + " Amount")].val() || 0));
            obj.sync("updateAsset");
          }
        });
      });
    }

    for (var i in sheet.summary) {
      var tabData = sheet.summary[i];
      var tab = genIcon(tabData.icon, tabData.name + "").appendTo(optionsBar);
      tab.attr("title", tabData.name);
      tab.css("margin-left", "8px");
      tab.attr("index", i);
      tab.click(function(){
        if ($(this).attr("index") < 0) {
          app.attr("displayMode", sheet.summary.length-1);
        }
        else if ($(this).attr("index") >= sheet.summary.length) {
          app.attr("displayMode", 0);
        }
        else {
          app.attr("displayMode", $(this).attr("index"));
        }
        obj.update();
      });
    }
  }

  var infoPanel = $("<div>").appendTo(div);
  infoPanel.addClass("flexcolumn");

  var newScope = duplicate(scope);
  newScope.display = sheet.summary[scope.displayMode].display;
  newScope.markup = "content";
  infoPanel.append(sync.render("ui_processUI")(obj, app, newScope));

  return div;
});

sync.render("ui_fakeVehicle_wrap", function(obj, app, scope) {
  var fakeSheet = sync.render("ui_vehicle")(obj.data.previewVeh, app, {
    sheet : obj.data.templates.display.vehicle,
    displayMode : app.attr("displayMode"),
    markup : true,
  });

  return fakeSheet;
});

sync.render("ui_fakeSummary_wrap", function(obj, app, scope) {
  var fakeSheet = sync.render("ui_characterSummary")(obj.data.previewChar, app, {
    sheet : obj.data.templates.display.sheet,
    displayMode : parseInt(app.attr("displayMode") || 0),
    markup : true,
  });

  return fakeSheet;
});

sync.render("ui_fakeSheet_wrap", function(obj, app, scope) {
  console.log("Here");
  var fakeSheet = sync.render("ui_characterSheet")(obj.data.previewChar, app, {
    sheet : obj.data.templates.display.sheet,
    markup : true,
  });

  return fakeSheet;
});

sync.render("ui_fakeItem_wrap", function(obj, app, scope) {
  var fakeSheet = sync.render("ui_renderItem")(obj.data.previewItem, app, {
    templates : obj.data.templates,
    markup : true,
  }).addClass("flex");

  return fakeSheet;
});

sync.render("ui_fakeSheet", function(obj, app, scope) {
  var div = $("<div>");

  var sheet = scope.sheet || game.templates.display.sheet;
  var vehicle = scope.vehicle || game.templates.display.vehicle;
  for (var i in sheet.style) {
    div.css(i, sheet.style[i]);
  }

  var charWrapper = $("<div>").appendTo(div);
  charWrapper.addClass("flexcolumn flex");
  charWrapper.css("overflow-y", "auto");
  charWrapper.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  charWrapper.scroll(function(){
    app.attr("_lastScrollTop", charWrapper.scrollTop());
    app.attr("_lastScrollLeft", charWrapper.scrollLeft());
  });
  var charContents = $("<div>").appendTo(charWrapper);

  var list = $("<div>").appendTo(charContents);
  list.addClass("fit-x flexaround flexwrap");

  var newScope = duplicate(scope);
  newScope.display = sheet.content;
  newScope.markup = "content";
  charContents.append(sync.render("ui_processUI")(obj, app, newScope));

  var tabContent = genNavBar("flexmiddle background alttext");

  function tabWrap(importData, index) {
    tabContent.generateTab(importData.name, importData.icon, function(parent) {
      var newScope = duplicate(scope);
      newScope.display = importData.display;
      newScope.markup = "tabs";
      parent.append(sync.render("ui_processUI")(obj, app, newScope));

      if (app) {
        app.attr("char_tab", importData.name);
      }
    });
  }

  for (var index in sheet.tabs) {
    tabWrap(sheet.tabs[index], index);
  }

  if (app) {
    if (!app.attr("char_tab")) {
      app.attr("char_tab", sheet.tabs[0].name);
    }
    tabContent.selectTab(app.attr("char_tab"));
  }
  else {
    tabContent.selectTab(sheet.tabs[0].name);
  }

  tabContent.appendTo(charContents);

  return div;
});

sync.render("ui_JSON", function(obj, app, scope) {
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    lookup : app.attr("lookup"),
    textEdit : app.attr("textEdit") == "true",
    hideConfirm : app.attr("hideConfirm") == "true",
    closeTarget : app.attr("closeTarget"),
    width : app.attr("width"),
    height : app.attr("height")
  };

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var data = obj.data;
  var value = obj.data;
  if (scope.lookup) {
    value = sync.traverse(data, scope.lookup || "");
  }
  var errorFeedback = $("<div>").appendTo(div);
  errorFeedback.addClass("flexmiddle destroy");

  var inputTest = $("<textarea>").appendTo(div);
  inputTest.addClass("flex subtitle");
  if (scope.viewOnly) {
    inputTest.attr("disabled", true);
  }
  inputTest.css("min-width", scope.width || "300px");
  inputTest.css("min-height", scope.height || "300px");
  inputTest.text(JSON.stringify(value, null, 2));
  inputTest.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  inputTest.attr("_lastScrollLeft", app.attr("_lastScrollTop"));
  inputTest.scroll(function(){
    app.attr("_lastScrollTop", $(this).scrollTop());
    app.attr("_lastScrollLeft", $(this).scrollLeft());
  });
  inputTest.change(function(){
    errorFeedback.empty();
    try {
      var newData = eval("var variable = "+$(this).val()+"; variable");
      if (scope.lookup) {
        sync.traverse(obj.data, scope.lookup || "", newData);
      }
      else {
        obj.data = newData;
      }
      obj.update();
      if (app.attr("closeTarget")) {
        layout.coverlay(app.attr("closeTarget"));
      }
    }
    catch(err) {
      errorFeedback.append("<b>Error Parsing Data</b>");
    }
  });
  if (!scope.hideConfirm) {
    var button = $("<button>").appendTo(div);
    button.append("Confirm");
  }
  return div;
});

sync.render("ui_tableEditor", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), lookup : app.attr("lookup"), structure : app.attr("structure"), textEdit : app.attr("textEdit") == "true"};

  var div = $("<div>");
  div.addClass("flexcolumn flex padding");

  for (var key in obj.data.templates.tables) {
    var table = obj.data.templates.tables[key];

    var tableWrap = $("<div>").appendTo(div);
    tableWrap.addClass("flexcolumn");

    var tableDiv = $("<div>").appendTo(tableWrap);
    tableDiv.addClass("flexcolumn");

    var headerRow = $("<div>").appendTo(tableDiv);
    headerRow.addClass("flexrow flexmiddle");

    var label = $("<div class='flexrow outlinebottom flex lrpadding'><b class='flex'>"+key+"</b></div>").appendTo(headerRow);
    var remove = genIcon("remove").appendTo(label);
    remove.addClass("destroy flexmiddle");
    remove.attr("table", key);
    remove.click(function(){
      delete obj.data.templates.tables[$(this).attr("table")];
      obj.update();
    });

    for (var i in table) {
      var entryRow = $("<div>").appendTo(tableDiv);
      entryRow.addClass("flexrow flexaround smooth padding subtitle");

      entryRow.append("<b class='lrpadding flexmiddle' style='min-width : 65px;'>"+i+"</b>");

      var entryMarco = genInput({
        parent : entryRow,
        placeholder : "Enter macro value",
        value : table[i],
        key : i,
        table : key,
      }).addClass("flex");
      entryMarco.change(function(){
        obj.data.templates.tables[$(this).attr("table")][$(this).attr("key")] = $(this).val();
      });
      var remove = genIcon("remove").appendTo(entryRow);
      remove.addClass("destroy flexmiddle lrpadding");
      remove.attr("table", key);
      remove.attr("key", i);
      remove.click(function(){
        delete obj.data.templates.tables[$(this).attr("table")][$(this).attr("key")];
        obj.update();
      });
    }

    var newRow = genIcon("plus", "New row").appendTo(tableDiv);
    newRow.addClass("create");
    newRow.attr("index", key);
    newRow.click(function(){
      var index = $(this).attr("index");
      obj.data.templates.tables[index] = obj.data.templates.tables[index] || {};
      ui_prompt({
        target : $(this),
        inputs : {
          "Lookup Key" : {placeholder : "Key or Range (ex. 53-56)"}
        },
        click : function(ev, inputs) {
          if (inputs["Lookup Key"].val()) {
            obj.data.templates.tables[index][inputs["Lookup Key"].val()] = "";
            obj.update();
          }
          else {
            sendAlert({text : "Lookup Key must be defined"});
          }
        }
      });
    });
  }

  var newTable = genIcon("plus", "New table").appendTo(div);
  newTable.addClass("create fit-x flexmiddle");
  newTable.click(function(){
    obj.data.templates.tables = obj.data.templates.tables || {};
    ui_prompt({
      target : $(this),
      inputs : {
        "Table Key" : "",
      },
      click : function(ev, inputs) {
        if (inputs["Table Key"].val()) {
          if (!obj.data.templates.tables[inputs["Table Key"].val()]) {
            obj.data.templates.tables[inputs["Table Key"].val()] = {};
            obj.update();
          }
          else {
            sendAlert({text : "Table Key must be unique"});
          }
        }
        else {
          sendAlert({text : "Table Key must be valid"});
        }
      }
    });
  });

  return div;
});

sync.render("ui_calcEditor", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), lookup : app.attr("lookup"), structure : app.attr("structure"), textEdit : app.attr("textEdit") == "true"};

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var data = obj.data;

  var structure = obj.data;
  if (scope.structure) {
    structure = sync.traverse(data, scope.structure || "");
  }

  var value = obj.data;
  if (scope.lookup) {
    value = sync.traverse(data, scope.lookup || "");
  }

  var calcList = $("<div>").appendTo(div);
  calcList.addClass("lpadding");
  calcList.sortable({
    update : function(ev, ui) {
      var newIndex;
      var count = 0;
      $(ui.item).attr("ignore", true);
      calcList.children().each(function(){
        if ($(this).attr("ignore")){
          newIndex = count;
        }
        count += 1;
      });
      var old = value.splice($(ui.item).attr("index"), 1);
      util.insert(value, newIndex, old[0]);
      obj.update();
    }
  });

  var dataList = $("<datalist>").appendTo(calcList);
  dataList.attr("id", "homebrew-calc-edit");
  var template = {stats : "", info : "", counters : ""};
  for (var key in template) {
    var path = key;
    for (var subKey in game.templates.character[key]) {
      path = key + "." + subKey;
      var option = $("<option>").appendTo(dataList);
      option.attr("value", path);
    }
  }

  for (var i in value) {
    var calcWrap = $("<div>").appendTo(calcList);
    calcWrap.addClass("flexcolumn padding outline smooth hover2");
    calcWrap.attr("index", i);
    if (value[i].name && i != 0) {
      calcWrap.css("margin-top", "3em");
    }
    var titlePlate = $("<div>").appendTo(calcWrap);
    titlePlate.addClass("flexrow spadding");

    function wrapF(index) {
      titlePlate.append("<b class='lrpadding'>#"+index+"</b>");

      var targetName = genIcon("", ((value[index].name)?(value[index].name):(""))).appendTo(titlePlate);
      targetName.addClass("subtitle bold flexmiddle lrpadding outlinebottom");
      targetName.css("min-width", "30px");
      targetName.attr("index", index);
      targetName.click(function(){
        var index = $(this).attr("index");
        var popout = ui_prompt({
          target :  $(this),
          inputs : {"Name" : value[index].name},
          click : function(ev, inputs){
            if (inputs["Name"].val()) {
              value[index].name = inputs["Name"].val();
            }
            else {
              delete value[index].name;
            }
            obj.update();
          }
        });
      });
      titlePlate.append("<text class='flex'></text>");
      titlePlate.append("<text class='subtitle lrpadding flexmiddle'>Target : </text>");

      var target = genInput({
        type : "list",
        list : "homebrew-calc-edit",
        parent : titlePlate,
        index : index,
        value : value[index].target,
        placeholder : "Target to Overwrite",
        style : {color : "#333"}
      }).addClass("subtitle flex lrpadding");

      target.change(function(){
        if ($(this).val()) {
          value[$(this).attr("index")].target = $(this).val();
          obj.update();
        }
      });

      var remove = genIcon("remove").appendTo(titlePlate);
      remove.addClass("destroy");
      remove.attr("index", index);
      remove.click(function(){
        value.splice($(this).attr("index"), 1);
        obj.update();
      });
    }
    wrapF(i);

    var wrap = $("<div>").appendTo(calcWrap);
    wrap.addClass("flexrow flexaround spadding");
    var macro = $("<text class='subtitle flexmiddle lrpadding'>Value Macro</text>").appendTo(wrap);
    var equation = genInput({
      parent : wrap,
      index : i,
      value : value[i].eq,
      placeholder : "Assign value (Can be equation)",
      style : {"font-size" : "0.8em", color : "#333"}
    });
    equation.addClass("flex lrpadding");
    equation.change(function(){
      value[$(this).attr("index")].eq = $(this).val();
      obj.update();
    });

    var wrap = $("<div>").appendTo(calcWrap);
    wrap.addClass("flexrow flexaround spadding");
    var macro = $("<text class='subtitle flexmiddle lrpadding'>Condition Macro</text>").appendTo(wrap);
    var cond = genInput({
      parent : wrap,
      index : i,
      value : value[i].cond,
      placeholder : "Condition (ex. 1<0)",
      style : {"font-size" : "0.8em", color : "#333"}
    });
    cond.addClass("flex lrpadding");
    cond.change(function(){
      value[$(this).attr("index")].cond = $(this).val();
      obj.update();
    });
  }

  var addCalc = genIcon("plus", "Add").appendTo(div);
  addCalc.addClass("create spadding");
  addCalc.click(function(){
    value = value || [];
    value.push({}),
    obj.update();
  });

  return div;
});

sync.render("ui_previewUI", function(obj, app, scope){
  return sync.render("ui_processUI")(obj.data.previewChar, app, {display : obj.data.dummyData, context : sync.defaultContext()}).addClass("fit-xy padding");
});

sync.render("ui_displayTree", function(obj, app, scope) {
  scope = scope || {app : app.attr("targetApp") || app.attr("id"), markup : app.attr("markup"), display : sync.traverse(obj.data, app.attr("display")), path : app.attr("path")};
  var div = $("<div>");

  function build(sData, lastLookup) {
    var section = $("<div>").appendTo(div);
    section.addClass("flexcolumn");
    section.css("padding-left", "1em");
    section.css("padding-right", "1em");
    var first = false;
    if (!lastLookup) {
      lastLookup = scope.app+"_0";
      first = true;
    }
    var name = lastLookup;
    var icon = "";
    if (sData.classes && sData.classes.match("flexcolumn")) {
      icon = 'resize-vertical';
      name = "Columns";
    }
    else if (sData.classes && sData.classes.match("flexrow")) {
      name = "Rows";
      icon = "resize-horizontal";
    }
    if (sData.ui) {
      name = sData.ui;
      icon = "edit";
    }
    if (sData.apps) {
      name = "Apps";
      icon = "th-large";
    }
    if (sData.link) {
      name = sData.link;
      icon = "link"
    }
    if (sData.icon) {
      name = sData.icon;
      icon = "exclamation-sign"
    }

    if (sData.name) {
      name = sData.name;
      icon = "text-color"
    }
    if (sData.target) {
      name = sData.target;
      icon = "";
    }
    var row = $("<div>").appendTo(section);
    row.addClass("flexrow");
    row.attr("target", lastLookup);
    row.hover(function(){
      $("#"+(scope.markup || "")+$(this).attr("target")).addClass("selected");
    },
    function(){
      $("#"+(scope.markup || "")+$(this).attr("target")).removeClass("selected");
    });

    var link = genIcon(icon, name).appendTo(row);
    link.attr("target", lastLookup);
    link.addClass("spadding hover2");
    if (!first) {
      link.click(function(){
        var replace = $(this).attr("target").replace(scope.app+"_0-", "");
        while (replace.match("-")) {
          replace = replace.replace("-", ".");
        }
        var select = sync.newApp("ui_JSON");
        select.attr("lookup", (scope.path || "templates.display.sheet.content.")+replace);
        obj.addApp(select);

        var popout = ui_popOut({
          target : $(this),
          id : "json-editor"
        }, select);
        popout.resizable();
      });

      function clickWrap(scope, lastLookup) {
        setTimeout(function(){
          $("#"+(scope.markup || "")+lastLookup).hover(function(ev){
            $(this).addClass("selected");
            ev.stopPropagation();
            ev.preventDefault();
          },
          function(){
            $(this).removeClass("selected");
          });
          $("#"+(scope.markup || "")+lastLookup).attr("target", lastLookup);
          $("#"+(scope.markup || "")+lastLookup).unbind("click");
          $("#"+(scope.markup || "")+lastLookup).css("cursor", "pointer");
          $("#"+(scope.markup || "")+lastLookup).click(function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            var replace = $(this).attr("target").replace(scope.app+"_0-", "");
            while (replace.match("-")) {
              replace = replace.replace("-", ".");
            }
            var select = sync.newApp("ui_JSON");
            select.attr("lookup", (scope.path || "templates.display.sheet.content.")+replace);
            obj.addApp(select);

            var popout = ui_popOut({
              target : $(this),
              id : "json-editor",
              align : "bottom"
            }, select);
            popout.resizable();
          });
        }, 10);
      }
      clickWrap(scope, lastLookup);
    }
    else {

      function clickWrap(scope, lastLookup) {
        setTimeout(function(){
          $("#"+(scope.markup || "")+lastLookup).hover(function(ev){
            $(this).addClass("selected");
            ev.stopPropagation();
            ev.preventDefault();
          },
          function(){
            $(this).removeClass("selected");
          });
          $("#"+(scope.markup || "")+lastLookup).attr("target", lastLookup);
          $("#"+(scope.markup || "")+lastLookup).unbind("click");
          $("#"+(scope.markup || "")+lastLookup).css("cursor", "pointer");
          $("#"+(scope.markup || "")+lastLookup).click(function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            var replace = $(this).attr("target").replace(scope.app+"_0-", "");
            while (replace.match("-")) {
              replace = replace.replace("-", ".");
            }
            var select = sync.newApp("ui_JSON");
            if (scope.path) {
              select.attr("lookup", scope.path.substring(0, scope.path.length-1));
            }
            else {
              select.attr("lookup", "templates.display.sheet.content");
            }
            obj.addApp(select);

            var popout = ui_popOut({
              target : $(this),
              id : "json-editor",
              align : "bottom"
            }, select);
            popout.resizable();
          });
        }, 10);
      }
      clickWrap(scope, lastLookup);

      link.click(function(){
        var replace = $(this).attr("target").replace(scope.app+"_0-", "");
        while (replace.match("-")) {
          replace = replace.replace("-", ".");
        }
        var select = sync.newApp("ui_JSON");
        if (scope.path) {
          select.attr("lookup", scope.path.substring(0, scope.path.length-1));
        }
        else {
          select.attr("lookup", "templates.display.sheet.content");
        }
        obj.addApp(select);

        var popout = ui_popOut({
          target : $(this),
          id : "json-editor"
        }, select);
        popout.resizable();
      });
    }

    if (sData.display) {
      if (!scope.viewOnly) {
        var newSection = $("<div>").appendTo(section);
        newSection.css("padding-left", "1em");

        var add = genIcon("plus").appendTo(row);
        add.addClass("create flexmiddle lrpadding");
        add.attr("target", lastLookup);
        add.css("font-size", "1.2em");
        add.hover(function(){
          $("#"+(scope.markup || "")+$(this).attr("target")).addClass("selected");
        },
        function(){
          $("#"+(scope.markup || "")+$(this).attr("target")).removeClass("selected");
        });
        add.click(function(){
          obj.data.dummyData = {};

          var content = $("<div>");
          content.addClass("flexcolumn fit-xy");

          var navBar = genNavBar("background alttext", "flex", "4px");
          navBar.addClass("flex");
          navBar.generateTab("Advanced", "cog", function(parent){
            var newApp = sync.newApp("ui_JSON").appendTo(parent);
            newApp.attr("textEdit", true);
            newApp.attr("lookup", "dummyData");
            obj.addApp(newApp);

            var confirm = $("<button>").appendTo(parent);
            confirm.append("Confirm");
            confirm.click(function(){
              var pushObj = {
                classes : classes.val(),
                target : target.val(),
                name : name.val(),
              };
              sData.display.push(pushObj);
              obj.update();
              layout.coverlay("add");
            });
          });
          navBar.generateTab("Basic", "ok", function(parent){
            var row = $("<div>").appendTo(parent);
            row.addClass("flexrow flex");

            var styling = $("<div>").appendTo(row);
            styling.addClass("flexcolumn flex");
            styling.append("<div class='flexmiddle background alttext'><b>Styling</b></div>");

            var layouts = [
              {classes : "", name : "Default"},
              {classes : "flexrow flexaround", name : "Balanced Row Layout"},
              {classes : "flexrow flexmiddle", name : "Centered Row Layout"},
              {classes : "flexrow", name : "Flat Row Layout"},
              {classes : "flexrow flexbetween", name : "Spaced Row Layout"},
              {classes : "flexcolumn flexaround", name : "Balanced Column Layout"},
              {classes : "flexcolumn flexmiddle", name : "Centered Column Layout"},
              {classes : "flexcolumn", name : "Flat Column Layout"},
              {classes : "flexcolumn flexbetween", name : "Spaced Column Layout"},
            ];

            var layoutDiv = $("<div>").appendTo(styling);
            layoutDiv.addClass("flexcolumn flex");
            layoutDiv.css("position", "relative");
            layoutDiv.css("overflow", "auto");

            var list = $("<div>").appendTo(layoutDiv);
            list.addClass("fit-x padding");
            list.css("position", "absolute");

            for (var i in layouts) {
              var layoutWrapper = $("<div>").appendTo(list);
              layoutWrapper.addClass("flex outlinebottom hover2 subtitle spadding");
              layoutWrapper.attr("index", i);
              layoutWrapper.append(layouts[i].name);
              layoutWrapper.click(function(){
                obj.data.dummyData.classes = layouts[$(this).attr("index")].classes;
                obj.update();
              });
            }

            var labeling = $("<div>").appendTo(row);
            labeling.addClass("flexcolumn flex");
            labeling.append("<div class='flexmiddle background alttext'><b>Labeling</b></div>");

            var labelDiv = $("<div>").appendTo(labeling);
            labelDiv.addClass("flexcolumn flex");

            var labelDiv = $("<div>").appendTo(labelDiv);
            labelDiv.addClass("flexcolumn padding");
            labelDiv.append("<b>Name</b>");
            var name = genInput({
              parent : labelDiv,
              placeholder : "Name (Macro)",
            });
            name.change(function(){
              obj.data.dummyData.name = $(this).val();
              obj.update();
            });

            labelDiv.append("<b>Value</b>");
            var value = genInput({
              parent : labelDiv,
              placeholder : "Value (Macro)",
            });
            value.change(function(){
              obj.data.dummyData.value = $(this).val();
              obj.update();
            });
            labelDiv.append("<b>Target</b>");

            var dataList = $("<datalist>").appendTo(labelDiv);
            dataList.attr("id", "homebrew-list-edit");
            var template = {stats : "", info : "", counters : ""};
            for (var key in template) {
              var path = key;
              for (var subKey in game.templates.character[key]) {
                path = key + "." + subKey;
                var option = $("<option>").appendTo(dataList);
                option.attr("value", path);
              }
            }

            var input = genInput({
              parent : labelDiv,
              type : "list",
              list : "homebrew-list-edit",
              id : "homebrew-target-input",
              placeholder : "Target to edit",
            });
            input.change(function() {
              obj.data.dummyData.target = $(this).val();
              obj.data.dummyData.edit = {cmd : "updateAsset"};
              delete obj.data.dummyData.scope;
              delete obj.data.dummyData.ui;
              obj.update();
              layout.coverlay("roll-stat-list");
            });

            labelDiv.append("<a class='fit-x flexmiddle subtitle' href='https://getbootstrap.com/docs/3.3/components/' target='_blank'>Icon List</a>");
            labelDiv.append("<b>Link</b>");
            var link = genInput({
              parent : labelDiv,
              placeholder : "Link Icon (Hyperlink)",
            });
            link.change(function(){
              obj.data.dummyData.link = $(this).val();
              obj.update();
            });

            labelDiv.append("<b>Icon</b>");
            var icon = genInput({
              parent : labelDiv,
              placeholder : "Icon (Plain)",
            });
            icon.change(function(){
              obj.data.dummyData.icon = $(this).val();
              obj.update();
            });

            var confirm = $("<button>").appendTo(parent);
            confirm.append("Confirm");
            confirm.click(function(){
              if (!obj.data.dummyData.ui && !obj.data.dummyData.edit && !obj.data.dummyData.scope && !obj.data.dummyData.apps
                  && !obj.data.dummyData.applyUI && !obj.data.dummyData.value && !obj.data.dummyData.name) {
                obj.data.dummyData.display = [];
              }
              sData.display.push(obj.data.dummyData);
              obj.update();
              layout.coverlay("add");
            });
          });
          navBar.generateTab("Special Interface", "list-alt", function(parent) {
            var uiDiv = $("<div>").appendTo(parent);
            uiDiv.addClass("flexrow flex");
            uiDiv.css("height", "30vh");

            var uiWrap = $("<div>").appendTo(uiDiv);
            uiWrap.addClass("flexcolumn flex");
            uiWrap.css("position", "relative");
            uiWrap.css("overflow", "auto");

            var uiPreview = sync.newApp("ui_previewUI").appendTo(uiDiv);
            obj.addApp(uiPreview);

            var ui = [
              {
                value : sync.newValue("Maxbox Name", 0, 0, 10),
                scope : {ui : "ui_maxbox", target : "", scope : {title : "Maxbox Title"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {title : {value : "Default Title", hint : "Descriptive Title"}}
                }
              },
              {
                value : {value : sync.newValue("Editable Name", 3, 0, 10)},
                scope : {ui : "ui_editable", scope : {increment : 1, bar : true, ui : "ui_maxbox", lookup : "value"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    increment : {value : 1, hint : "Increment value -/+"},
                    bar : {value : [true, false], hint : "Progress Bar?"},
                    ui : {value : "ui_maxbox", hint : "UI element to appear when clicked"},
                  }
                }
              },
              {
                value : {value : sync.newValue("Progress Bar", 3, 0, 10)},
                scope : {ui : "ui_progressBar", scope : {lookup : "value"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    percentage : {value : 0, hint : "Current Value (Macro)"},
                    max : {value : 10, hint : "Maximum Value (Macro)"},
                    height : {hint : "Height of the bar"},
                    col : {hint : "Macro that returns the color of the bar"}
                  }
                }
              },
              {
                value : {checked : sync.newValue("New Checkbox")},
                scope : {ui : "ui_checkbox", scope : {cond : "true", lookup : "checked", title : "'Checkbox Title'"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    cond : {value : "true", hint : "Macro that determines if checked/unchecked"},
                    title : {value : "Default Title", hint : "Descriptive Title"},
                    checked : {value : "", hint : "If checked, save this evaluated macro"},
                    saveInto : {value : "", hint : "Reference Location to save this into"},
                    unchecked : {value : "", hint : "If unchecked, save this evaluated macro"},
                  }
                }
              },
              {
                value : {roll : sync.newValue("Dice-Rollable Name", "2d10")},
                scope : {ui : "ui_diceable", scope : {name : "'Dice-Rollable Title'", value : "'Diceable Value'"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    name : {value : "", hint : "Macro that gets used as the title"},
                    value : {value : "", hint : "Value that gets used as when rolled"}
                  }
                }
              },
              {
                value : {stats : {stat : sync.newValue("Stat Name", "2d10")}},
                scope : {ui : "ui_plainStat", scope : {lookup : "stats.stat", name : "'Plain Title'"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    name : {value : "", hint : "Macro that gets used as the title"},
                  }
                }
              },
              {
                value : {stats : {stat : sync.newValue("Stat Name", "2d10")}},
                scope : {ui : "ui_fantasyStat", scope : {lookup : "stats.stat", name : "'Fantasy Title'"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    name : {value : "", hint : "Macro that gets used as the title"},
                  }
                }
              },
              {
                value : {stats : {stat : sync.newValue("Stat Name", "2d10")}},
                scope : {ui : "ui_rankedStat", scope : {lookup : "stats.stat", name : "'Ranked Title'"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    name : {value : "", hint : "Macro that gets used as the title"},
                  }
                }
              },
              {
                value : {stat : sync.newValue("Stat Name", "2d10")},
                scope : {ui : "ui_characterArmor", scope : {width : "50px", height : "50px", armor : "ui_armorValue"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    width : {value : "50px", hint : "Width of the display"},
                    height : {value : "50px", hint : "Height of the display"},
                    name : {value : "", hint : "Macro that gets used as the title"},
                  }
                }
              },
              {
                value : {counters : {exp : sync.newValue("Exp Name", 30, null, null, {added : 50}), level : sync.newValue("Level", 3)}},
                scope : {ui : "ui_expCounter", scope : {level : "counters.level", lookup : "counters.exp"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    level : {hint : "Optionally reference a variable for levels"},
                  }
                }
              },
              {
                value : {image : sync.newValue("Image", "/content/icons/"+util.art.icons[Math.floor(util.art.icons.length * Math.random())])},
                scope : {ui : "ui_icon", scope : {lookup : "image", width : "100px", height : "100px"}},
                options : {
                  target : {hint : "Reference Value"},
                  scope : {
                    width : {value : "100px", hint : "Width of the display"},
                    height : {value : "100px", hint : "Height of the display"},
                  }
                }
              },
            ];

            var uiList = $("<div>").appendTo(uiWrap);
            uiList.addClass("flexcolumn flexmiddle fit-x padding");
            uiList.css("position", "absolute");

            for (var i in ui) {
              var newApp = $("<div>").appendTo(uiList);
              newApp.addClass("lightoutline lrpadding fit-x");
              newApp.attr("title", ui[i].scope.ui);
              newApp.css("padding", "1em");
              newApp.css("cursor", "pointer");
              newApp.attr("index", i);
              newApp.hover(
                function(){
                  $(this).addClass("focus");
                },
                function(){
                  $(this).removeClass("focus");
                }
              );
              newApp.click(function(){
                var content = $("<div>");
                content.addClass("flexcolumn");

                var data = ui[$(this).attr("index")];
                var newData = {ui : data.scope.ui};
                for (var i in data.options) {
                  content.append("<b>"+i+"</b>");
                  var optionWrap = $("<div>").appendTo(content);
                  optionWrap.addClass("padding");
                  if (i == "target") {
                    optionWrap.append("<i class='subtitle'>"+data.options[i].hint+"</i>");
                    var optionWrap = $("<div>").appendTo(content);
                    var dataList = $("<datalist>").appendTo(optionWrap);
                    dataList.attr("id", "homebrew-list-"+i);

                    if (Array.isArray(data.options[i].value)) {
                      for (var j in data.options[i].value) {
                        var option = $("<option>").appendTo(dataList);
                        if (data.options[i].value[j] instanceof Object) {
                          option.attr("value", JSON.stringify(data.options[i].value[j]));
                        }
                        else {
                          option.attr("value", data.options[i].value[j]);
                        }
                      }
                    }
                    else {
                      var template = {stats : "", info : "", counters : ""};
                      for (var key in template) {
                        var path = key;
                        for (var subKey in game.templates.character[key]) {
                          path = key + "." + subKey;
                          var option = $("<option>").appendTo(dataList);
                          option.attr("value", path);
                        }
                      }
                    }

                    var input = genInput({
                      parent : optionWrap,
                      type : "list",
                      list : "homebrew-list-"+i,
                      id : "homebrew-target-input"+i,
                      key : i,
                    });
                    input.change(function(){
                      sync.traverse(newData, $(this).attr("key"), $(this).val());
                    });

                    if (Array.isArray(data.options[i].value)) {
                      input.val(data.options[i].value[0]);
                    }
                    else {
                      input.val(data.options[i].value);
                    }
                    sync.traverse(newData, i, input.val());
                  }
                  else if (data.options[i] instanceof Object) {
                    var optionWrap = $("<div>").appendTo(content);
                    optionWrap.addClass("flexcolumn padding");

                    for (var k in data.options[i]) {
                      var dataList = $("<datalist>").appendTo(optionWrap);
                      dataList.attr("id", "homebrew-list-"+i+"-"+k);
                      if (Array.isArray(data.options[i][k].value)) {
                        for (var j in data.options[i][k].value) {
                          var option = $("<option>").appendTo(dataList);
                          if (data.options[i][k].value[j] instanceof Object) {
                            option.attr("value", JSON.stringify(data.options[i][k].value[j]));
                          }
                          else {
                            option.attr("value", data.options[i][k].value[j]);
                          }
                        }
                      }
                      optionWrap.append("<i class='subtitle'>"+data.options[i][k].hint+"</i>");
                      var input = genInput({
                        parent : optionWrap,
                        type : "list",
                        list : "homebrew-list-"+i+"-"+k,
                        key : i+"."+k,
                      });
                      input.change(function(){
                        sync.traverse(newData, $(this).attr("key"), $(this).val());
                      });
                      if (Array.isArray(data.options[i][k].value)) {
                        input.val(data.options[i][k].value[0]);
                      }
                      else {
                        input.val(data.options[i][k].value);
                      }
                      sync.traverse(newData, i+"."+k, input.val());
                    }
                  }
                }

                var button = $("<button>").appendTo(content);
                button.append("Confirm");
                button.click(function(){
                  obj.data.dummyData = newData;
                  obj.update();
                  layout.coverlay("ui-builder");
                });

                ui_popOut({
                  target : $(this),
                  id : "ui-builder",
                }, content);
              });
              var dummyObj = sync.dummyObj();
              dummyObj.data = duplicate(ui[i].value);
              sync.render(ui[i].scope.ui)(dummyObj, newApp, ui[i].scope.scope).css("pointer-events", "none").appendTo(newApp);
            }

            var button = $("<button>").appendTo(parent);
            button.append("Confirm");
            button.click(function(){
              if (!obj.data.dummyData.ui && !obj.data.dummyData.edit && !obj.data.dummyData.scope && !obj.data.dummyData.apps
                  && !obj.data.dummyData.applyUI && !obj.data.dummyData.value && !obj.data.dummyData.name) {
                obj.data.dummyData.display = [];
              }
              sData.display.push(obj.data.dummyData);
              obj.update();
              layout.coverlay("add");
            });
          });
          navBar.appendTo(content);
          navBar.selectTab("Basic");

          var preview = $("<div>").appendTo(content);
          preview.addClass("flexcolumn");
          preview.css("height", "200px");
          preview.append("<div class='flexmiddle background alttext'><b>Preview</b></div>");

          var uiPreview = sync.newApp("ui_previewUI").appendTo(preview);
          obj.addApp(uiPreview);

          var popout = ui_popOut({
            target : $(this),
            id : "add",
            style : {width : "600px", height : "600px"}
          }, content);
          popout.resizable();
        });
      }
    }

    if (sData.display) {
      var sectionDisplay = $("<div>").appendTo(section);
      sectionDisplay.addClass("flexcolumn");
      sectionDisplay.sortable({
        update : function(ev, ui) {
          var newIndex;
          var count = 0;
          $(ui.item).attr("ignore", true);
          sectionDisplay.children().each(function(){
            if ($(this).attr("ignore")){
              newIndex = count;
            }
            count += 1;
          });
          var old = sData.display.splice($(ui.item).attr("index"), 1);
          util.insert(sData.display, newIndex, old[0]);
          obj.update();
        }
      });
      for (var i in sData.display) {
        if (sData.display[i]) {
          var tempSection = build(sData.display[i], lastLookup+"-display-"+i).appendTo(sectionDisplay);
          tempSection.addClass("flexrow");
          tempSection.attr("index", i);

          var delWrap = $("<div>");
          delWrap.addClass("flexmiddle");

          var del = genIcon("trash").appendTo(delWrap);
          del.attr("index", i);
          del.addClass("destroy lrpadding");
          del.click(function(){
            sData.display.splice($(this).attr("index"), 1);
            obj.update();
          });
          $(tempSection.children()[0]).prepend(delWrap);
        }
      }
    }
    return section;
  }
  build(scope.display);
  return div;
});

sync.render("ui_diceDisplayBuilder", function(obj, app, scope){
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", display : app.attr("diceKey")};
  var div = $("<div>");
  div.addClass("flexrow flex");

  var colWrap = $("<div>").appendTo(div);
  colWrap.addClass("flexcolumn flex");

  var col = $("<div>").appendTo(colWrap);
  col.addClass("flexrow flexwrap padding");

  for (var i in obj.data.templates.display.ui) {
    var button = $("<button>").appendTo(col);
    if (scope.display == i) {
      button.addClass("highlight alttext");
    }
    button.attr("key", i);
    button.append(i);
    button.click(function(){
      app.attr("diceKey", $(this).attr("key"));
      obj.update();
    });
  }

  var plus = $("<button>").appendTo(col);
  plus.addClass("background alttext");
  plus.append("New Display");
  plus.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Identifier" : {placeholder : "The unique identifier"}
      },
      click : function(ev, inputs) {
        if (inputs["Identifier"].val()) {
          obj.data.templates.display.ui[inputs["Identifier"].val()] = {
            classes : "",
            style : {},
            dice : {},
            displays : {},
            results : {},
          };
          obj.update();
        }
      }
    });
  });

  if (scope.display) {
    app.attr("lookup", "templates.display.ui."+scope.display);

    var select = sync.render("ui_JSON")(obj, app, null).appendTo(colWrap);
    select.addClass("flex padding");

    var dataRollWrap = $("<div>").appendTo(div);
    dataRollWrap.addClass("flexcolumn flex");
    dataRollWrap.append("<b class='underline'>Test your Display</b>");

    var dataDiv = $("<div>").appendTo(dataRollWrap);
    dataDiv.addClass("flexrow flex padding");

    var flavorText = $("<textarea>").appendTo(dataDiv);
    flavorText.addClass("flex");
    flavorText.val(app.attr("flavor") || "");
    flavorText.attr("placeholder", "Flavor Text");
    flavorText.change(function(){
      app.attr("flavor", $(this).val());
      obj.update();
    });

    var eqText = $("<textarea>").appendTo(dataDiv);
    eqText.addClass("flex");
    eqText.val(app.attr("equation") || "d20");
    eqText.attr("placeholder", "Equation");
    eqText.change(function(){
      app.attr("equation", $(this).val());
      obj.update();
    });

    var dataRoll = $("<div>").appendTo(dataRollWrap);
    dataRoll.addClass("flexcolumn flexmiddle flex padding");

    var wrapObj = sync.dummyObj();
    wrapObj.data = {data : sync.executeQuery((app.attr("equation") || "d20"), sync.defaultContext()), msg : "Flavor Text"};

    dataRoll.append("<b class='underline'>Result</b>");

    dataRoll.append("<b>"+(sync.eval(app.attr("flavor"), sync.defaultContext()) || "")+"</b>");

    var display = sync.render("ui_newDiceResults")(wrapObj, app, {display : obj.data.templates.display.ui[scope.display]}).appendTo(dataRoll);
    display.css("width", "350px");
    display.css("min-height", "200px");

    dataRoll.append("<b class='flex'></b>");
  }

  return div;
});

sync.render("ui_gameLibraries", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexcolumn");
  div.append("<b class='flex flexmiddle'>Library</b>");
  for (var i in obj.data.templates.library) {
    sync.render("ui_ent")(getEnt(obj.data.templates.library[i]), app, {
      click : function(ev, ui, ent) {
        obj.data.templates.library = obj.data.templates.library || [];
        for (var i in obj.data.templates.library) {
          if (obj.data.templates.library[i] == ent.id()) {
            obj.data.templates.library.splice(i, 1);
            obj.update();
            break;
          }
        }
      }
    }).appendTo(div);
  }
  if (!obj.data.templates.library.length) {
    div.append("<i class='flex flexmiddle subtitle'>No Pacakges</i>");
  }

  div.append("<b class='flex flexmiddle'>Packages in Personal Storage</b>");
  var empty = true;
  for (var i in game.locals["storage"].data.l) {
    var lData = game.locals["storage"].data.l[i];
    if (lData.a == "pk") {
      if (isNaN(lData._uid)) {
        if (!util.contains(obj.data.templates.library, lData._uid)) {
          empty = false;
          sync.render("ui_ent")(getEnt(lData._uid), app, {
            click : function(ev, ui, ent) {
              obj.data.templates.library = obj.data.templates.library || [];
              obj.data.templates.library.push(ent.id());
              obj.update();
            }
          }).appendTo(div);
        }
      }
      else {
        if (!util.contains(obj.data.templates.library, getCookie("UserID")+"_"+lData._uid)) {
          empty = false;
          sync.render("ui_ent")(game.locals["storage"].data.s[lData._uid], app, {
            click : function(ev, ui, ent) {
              obj.data.templates.library = obj.data.templates.library || [];
              obj.data.templates.library.push(ent.id());
              obj.update();
            }
          }).appendTo(div);
        }
      }
    }
  }
  if (empty) {
    div.append("<i class='flex flexmiddle subtitle'>No Pacakges</i>");
  }
  return div;
});

sync.render("ui_dataModel", function(obj, app, scope) {
  scope = scope || {path : app.attr("path"), blacklist : JSON.parse(app.attr("blacklist"))};

  var dataModel = sync.traverse(obj.data, scope.path);

  var characterWrap = $("<div>");
  characterWrap.addClass("flexrow flexwrap flexaround flex");

  var blacklist = scope.blacklist || {
    "info" : {blacklist : ["name", "img", "notes"]},
    "stats" : {blacklist : []},
    "counters" : {blacklist : []},
    "skills" : {blacklist : []},
  }

  for (var key in dataModel) {
    if (key.charAt(0) != "_" && blacklist[key]) {
      var target = dataModel[key];
      var wrap = $("<div>").appendTo(characterWrap);
      wrap.addClass("flexcolumn flex padding outline smooth");
      wrap.css("min-width", "25%");
      var title = $("<b class='outlinebottom'>"+key+"</b>").appendTo(wrap);

      var addNew = genIcon("plus").appendTo(title);
      addNew.addClass("create spadding");
      addNew.attr("index", key);
      addNew.click(function(){
        var index = $(this).attr("index");
        var target = dataModel[index];
        if (blacklist[index].array) {
          target.push(sync.newValue("New Value", ""));
          obj.update();
        }
        else {
          ui_prompt({
            target : $(this),
            id : "add-data-structure",
            inputs : {
              "Key" : "",
            },
            click : function(ev, inputs) {
              if (inputs["Key"].val()) {
                target[inputs["Key"].val()] = sync.newValue("New Value", "");
                obj.update();
              }
            }
          });
        }
      });

      var dataWrap = $("<div>").appendTo(wrap);

      if (blacklist[key].array) {
        dataWrap.sortable({
          filter : ".data",
          update : function(ev, ui) {
            var newIndex;
            var count = 0;
            $(ui.item).attr("ignore", true);
            $(ui.item).parent().children().each(function(){
              if ($(this).attr("ignore")){
                newIndex = count;
              }
              count += 1;
            });
            var old = dataModel[$(ui.item).attr("key")].splice($(ui.item).attr("index"), 1);
            util.insert(dataModel[$(ui.item).attr("key")], newIndex, old[0]);
            obj.update();
          }
        });
      }

      for (var index in target) {
        var wrap = $("<div>").appendTo(dataWrap);
        wrap.addClass("flexrow flexbetween spadding");
        wrap.attr("index", index);
        wrap.attr("key", key);

        var link = genIcon("", index + " - " + target[index].name).appendTo(wrap);
        link.addClass("data");
        link.attr("index", index);
        link.attr("key", key);
        link.click(function(){
          var index = $(this).attr("index");
          var key = $(this).attr("key");
          var select = sync.newApp("ui_JSON");
          select.attr("lookup", "templates.character."+key+"."+index);
          obj.addApp(select);

          var popout = ui_popOut({
            target : $(this),
            id : "json-editor"
          }, select);
          popout.resizable();
        });

        if (!util.contains(blacklist[key].blacklist, index)) {
          var del = genIcon("trash").appendTo(wrap);
          del.addClass("destroy");
          del.attr("index", index);
          del.attr("key", key);
          del.click(function(){
            var index = $(this).attr("index");
            var key = $(this).attr("key");
            if (blacklist[key].array) {
              dataModel[key].splice(index,1);
            }
            else {
              delete dataModel[key][index];
            }
            obj.update();
          });
        }
      }
    }
  }

  return characterWrap;
});


sync.render("ui_homebrew", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flex flexcolumn");
  if (!game.locals["homebrew"]) {
    game.locals["homebrew"] = game.locals["homebrew"] || sync.obj();
    game.locals["homebrew"].data = game.locals["homebrew"].data || {
      templates : duplicate(game.templates),
      previewChar : sync.dummyObj(),
      previewItem : sync.dummyObj(),
      previewVeh : sync.dummyObj(),
    };
    game.locals["homebrew"].data.previewChar.data = createCharacter(duplicate(game.templates.character), null, true, true, true, true);
    game.locals["homebrew"].data.previewChar.sync = function(){game.locals["homebrew"].data.previewChar.update()};
    game.locals["homebrew"].data.previewChar.update = function(rObj, newObj, target){
      game.locals["homebrew"].update();
      sync.update(game.locals["homebrew"].data.previewChar, newObj, target);
    };

    game.locals["homebrew"].data.previewItem.data = duplicate(game.templates.item);
    game.locals["homebrew"].data.previewItem.sync = function(){game.locals["homebrew"].data.previewItem.update()};
    game.locals["homebrew"].data.previewItem.update = function(rObj, newObj, target){
      game.locals["homebrew"].update();
      sync.update(game.locals["homebrew"].data.previewItem, newObj, target);
    };

    game.locals["homebrew"].data.previewVeh.data = duplicate(game.templates.vehicle);
    game.locals["homebrew"].data.previewVeh.sync = function(){game.locals["homebrew"].data.previewVeh.update()};
    game.locals["homebrew"].data.previewVeh.update = function(rObj, newObj, target){
      game.locals["homebrew"].update();
      sync.update(game.locals["homebrew"].data.previewVeh, newObj, target);
    };
  }
  var obj = game.locals["homebrew"];

  var test = {
    apps  :  "ui_characterArmor, ui_characterSavesProf, ui_calc, ui_characterSaves",
    classes  :  "",
    edit  :  "",
    icon  :  "user, education, screenshot, gift",
    minimized  :  "",
    name  :  "Dice, Stats, , Summary, Skills, Talents, Special Rules",
    style  :  "",
    target  :  "",
    ui  :  "ui_fantasyStat, ui_maxbox, ui_expCounter, ui_rankedStat",
  };
  var uis = {
    "ui_expCounter" : {
      cmd : "updateAsset",
      level : true
    },
    "ui_fantasyStat" : {
      cmd : "updateAsset",
      eventData : {
        data : "$die=d20;#roll=d20;{roll}+M{c:stats:Str}",
        msg : "@me.name+' tested {c:stats:Str:name}'",
        ui : "ui_statTest",
      }
    },
    "ui_maxbox" : {cmd : "updateAsset"},
    "ui_plainStat" : {cmd : "updateAsset"},
    "ui_rankedStat" : {
      cmd :"updateAsset",
      eventData : {
        data : "$die=d100;#threshold=@c.stats.WS;#roll=d100;@roll",
        msg : "@me.name+' tested @c.stats.WS.name'",
        ui : "ui_statTest"
      }
    }
  };
  var apps = {
    "ui_calc" : {
      classes : "flexrow lrpadding",
      displays : [{"touchArmor" : {name : "Touch:"}}]
    },
    "ui_characterArmor" : {
      armor : "ui_armorValue",
      height : "50px",
      width : "50px"
    }
  };

  var data = obj.data;
  var sheet = obj.data.templates.display.sheet;
  var vehicle = obj.data.templates.display.vehicle;
  var item = obj.data.templates.display.item;

  var row = $("<div>").appendTo(div);
  row.addClass("flex flexrow");

  var sidebar = $("<div>").appendTo(row);
  sidebar.addClass("fit-y flexcolumn background outline alttext spadding");
  sidebar.css("font-size", "1.5em");

  $("<b class='highlight smooth spadding outline alttext flexmiddle' title='This feature is in beta'>Beta</b>").appendTo(sidebar);

  var character = genIcon("user", "Character Data").appendTo(sidebar);
  character.click(function(){
    optionsLabel.text("Character Data");
    optionsMenu.empty();

    var blacklist = {
      "info" : {blacklist : ["name", "img", "notes"]},
      "stats" : {blacklist : []},
      "counters" : {blacklist : []},
      "skills" : {blacklist : []},
    }

    var characterWrap = sync.newApp("ui_dataModel").appendTo(optionsMenu);
    characterWrap.addClass("fit-xy");
    characterWrap.attr("blacklist", JSON.stringify(blacklist));
    characterWrap.attr("path", "templates.character");
    characterWrap.css("position", "absolute");
    characterWrap.css("left", "0");
    characterWrap.css("top", "0");

    obj.addApp(characterWrap);
  });

  var actions = genIcon("certificate", "Actions").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    optionsLabel.text("Actions");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.actions.c");
    obj.addApp(select);
  });

  var calc = genIcon("wrench", "Calculations").appendTo(sidebar);
  calc.css("margin-left", "1.5em");
  calc.css("font-size", "0.6em");
  calc.click(function(){
    optionsLabel.text("Calculations");
    optionsMenu.empty();
    obj.data.templates.display.sheet.calc = obj.data.templates.display.sheet.calc || [];

    var select = sync.newApp("ui_calcEditor").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.display.sheet.calc");
    select.attr("structure", "templates.character");
    obj.addApp(select);
  });

  var init = genIcon("fire", "Initiative").appendTo(sidebar);
  init.css("margin-left", "1.5em");
  init.css("font-size", "0.6em");
  init.click(function(){
    optionsLabel.text("Initiative");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.initiative");
    obj.addApp(select);
  });

  var skills = genIcon("wrench", "Skill Configuration").appendTo(sidebar);
  skills.css("margin-left", "1.5em");
  skills.css("font-size", "0.6em");
  skills.click(function(){
    optionsLabel.text("Rules");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.display.sheet.skills");
    obj.addApp(select);
  });

  var display = genIcon("list-alt", "Sheet").appendTo(sidebar);
  display.css("margin-left", "1.5em");
  display.css("font-size", "0.6em");
  display.click(function(){
    optionsLabel.empty();

    optionsMenu.empty();
    sheetWrap.empty();

    var fakeSheet = sync.newApp("ui_fakeSheet_wrap").appendTo(sheetWrap);
    obj.addApp(fakeSheet);

    /*var optionsSort = $("<div>").appendTo(optionsLabel);
    optionsSort.addClass("flexrow flexwrap");
    optionsSort.sortable({
      update : function(ev, ui) {
        var finalList = [];
        optionsSort.children().each(function(){
          if ($(this).attr("id") != null) {
            finalList.push(obj.data.templates.display.sheet.tabs[$(this).attr("id")]);
          }
        });
        obj.data.templates.display.sheet.tabs = finalList;
        obj.update();
      }
    });*/

    var button = $("<button>").appendTo(optionsLabel);
    button.addClass("highlight alttext");
    button.append("Sheet");
    button.click(function(){
      optionsLabel.children().each(function(){
        $(this).removeClass("highlight alttext");
        $(this).addClass("background");
      });
      $(this).addClass("highlight alttext");
      $(this).removeClass("background");

      optionsMenu.empty();

      var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
      display.addClass("fit-x");
      display.attr("targetApp", fakeSheet.attr("id"));
      display.attr("display", "templates.display.sheet.content");
      display.attr("path", "templates.display.sheet.content.");
      display.attr("markup", "content");
      display.css("position", "absolute");
      display.css("left", "0");
      display.css("top", "0");

      obj.addApp(display);
    });

    for (var i in obj.data.templates.display.sheet.tabs) {
      var tabData = obj.data.templates.display.sheet.tabs[i];
      var button = $("<button>").appendTo(optionsLabel);
      button.addClass("background");
      button.append(tabData.name);

      var remove = genIcon("remove").appendTo(button);
      remove.addClass("destroy lrpadding");
      remove.attr("index", i);
      remove.click(function(){
        var button = $(this).parent();
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          id : "remove-tab",
          confirm : "Delete Tab",
          click : function(ev, ui, inputs){
            obj.data.templates.display.sheet.tabs.splice(index, 1);
            obj.update();
          }
        });
      });

      button.attr("id", i);
      button.click(function(){
        var tabData = obj.data.templates.display.sheet.tabs[$(this).attr("id")];
        optionsLabel.children().each(function(){
          $(this).removeClass("highlight alttext");
          $(this).addClass("background");
        });
        $(this).addClass("highlight alttext");
        $(this).removeClass("background");

        optionsMenu.empty();

        var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
        display.addClass("fit-x");
        display.attr("targetApp", fakeSheet.attr("id"));
        display.attr("display", "templates.display.sheet.tabs."+$(this).attr("id")+".display");
        display.attr("path", "templates.display.sheet.tabs."+$(this).attr("id")+".display.");
        display.attr("markup", "tabs"+$(this).attr("id"));
        display.css("position", "absolute");
        display.css("left", "0");
        display.css("top", "0");

        obj.addApp(display);
      });
    }

    var addNew = genIcon("plus", "Add New Tab").appendTo(optionsLabel);
    addNew.addClass("lrpadding");
    addNew.click(function(){
      var before = $(this);

      var content = $("<div>");
      content.addClass("flexcolumn");

      content.append("<b>Name</b>");
      var name = genInput({
        parent : content,
        placeholder : "Enter Tab Name",
      });

      content.append("<b>Icon</b>");

      var icons = genInput({
        parent : content,
        placeholder : "Enter Icon Name",
      });
      icons.keyup(function(){
        icons.val(icons.val().replace("glyphicon", "").replace("glyphicon-", ""));
      });

      content.append("<a class='fit-x flexmiddle subtitle' href='https://getbootstrap.com/docs/3.3/components/' target='_blank'>Icon List</a>");

      var button = $("<button>").appendTo(content);
      button.append("Confirm");
      button.click(function(){
        if (name.val() || icons.val()) {
          obj.data.templates.display.sheet.tabs.push({
            name : name.val(),
            icon : icons.val(),
            display : []
          });

          var tabData = obj.data.templates.display.sheet.tabs[obj.data.templates.display.sheet.tabs.length-1];
          var button = $("<button>");
          before.before(button);
          button.addClass("background");
          button.append(tabData.name);
          button.attr("id", i);

          var remove = genIcon("remove").appendTo(button);
          remove.addClass("destroy");
          remove.attr("index", i);
          remove.click(function(){
            var button = $(this).parent();
            var index = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "remove-tab",
              confirm : "Delete Tab",
              click : function(ev, ui, inputs){
                button.remove();
                obj.data.templates.display.sheet.tabs.splice(index, 1);
                obj.update();
              }
            });
          });

          button.click(function(){
            var tabData = obj.data.templates.display.sheet.tabs[$(this).attr("id")];
            optionsLabel.children().each(function(){
              $(this).removeClass("highlight alttext");
              $(this).addClass("background");
            });
            $(this).addClass("highlight alttext");
            $(this).removeClass("background");

            optionsMenu.empty();
            var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
            display.addClass("fit-x");
            display.attr("targetApp", fakeSheet.attr("id"));
            display.attr("display", "templates.display.vehicle.summary."+$(this).attr("id")+".display");
            display.attr("path", "templates.display.vehicle.summary."+$(this).attr("id")+".display.");
            display.attr("markup", "vehicle"+$(this).attr("id"));
            display.css("position", "absolute");
            display.css("left", "0");
            display.css("top", "0");

            obj.addApp(display);
          });
          obj.update();
        }
        layout.coverlay("add-tab");
      });
      var pop = ui_popOut({
        target : $(this),
        id : "add-tab",
      }, content);
    });

    var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
    display.addClass("fit-x");
    display.attr("targetApp", fakeSheet.attr("id"));
    display.attr("display", "templates.display.sheet.content");
    display.attr("path", "templates.display.sheet.content.");
    display.attr("markup", "content");
    display.css("position", "absolute");
    display.css("left", "0");
    display.css("top", "0");

    obj.addApp(display);
  });

  var display = genIcon("user", "Summary").appendTo(sidebar);
  display.css("margin-left", "1.5em");
  display.css("font-size", "0.6em");
  display.click(function(){
    optionsLabel.empty();

    optionsMenu.empty();
    sheetWrap.empty();

    var fakeSheet = sync.newApp("ui_fakeSummary_wrap").appendTo(sheetWrap);
    obj.addApp(fakeSheet);

    for (var i in obj.data.templates.display.sheet.summary) {
      var tabData = obj.data.templates.display.sheet.summary[i];
      var button = $("<button>").appendTo(optionsLabel);
      button.addClass("background");
      button.append(tabData.name);
      button.attr("id", i);

      var remove = genIcon("remove").appendTo(button);
      remove.addClass("destroy");
      remove.attr("index", i);
      remove.click(function(){
        var button = $(this).parent();
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          id : "remove-tab",
          confirm : "Delete Tab",
          click : function(ev, ui, inputs){
            obj.data.templates.display.sheet.summary.splice(index, 1);
            obj.update();
          }
        });
      });

      button.click(function(){
        var tabData = obj.data.templates.display.sheet.summary[$(this).attr("id")];
        optionsLabel.children().each(function(){
          $(this).removeClass("highlight alttext");
          $(this).addClass("background");
        });
        $(this).addClass("highlight alttext");
        $(this).removeClass("background");

        optionsMenu.empty();
        var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
        display.addClass("fit-x");
        display.attr("targetApp", fakeSheet.attr("id"));
        display.attr("display", "templates.display.sheet.summary."+$(this).attr("id")+".display");
        display.attr("path", "templates.display.sheet.summary."+$(this).attr("id")+".display.");
        display.attr("markup", "summary"+$(this).attr("id"));
        display.css("position", "absolute");
        display.css("left", "0");
        display.css("top", "0");

        obj.addApp(display);
      });
    }

    var addNew = genIcon("plus", "Add New Tab").appendTo(optionsLabel);
    addNew.click(function(){
      var before = $(this);

      var content = $("<div>");
      content.addClass("flexcolumn");

      content.append("<b>Name</b>");
      var name = genInput({
        parent : content,
        placeholder : "Enter Tab Name",
      });

      content.append("<b>Icon</b>");

      var icons = genInput({
        parent : content,
        placeholder : "Enter Icon Name",
      });
      icons.keyup(function(){
        icons.val(icons.val().replace("glyphicon", "").replace("glyphicon-", ""));
      });

      content.append("<a class='fit-x flexmiddle subtitle' href='https://getbootstrap.com/docs/3.3/components/' target='_blank'>Icon List</a>");

      var button = $("<button>").appendTo(content);
      button.append("Confirm");
      button.click(function(){
        if (name.val() || icons.val()) {
          obj.data.templates.display.sheet.summary.push({
            name : name.val(),
            icon : icons.val(),
            display : []
          });

          var tabData = obj.data.templates.display.sheet.summary[obj.data.templates.display.sheet.summary.length-1];
          var button = $("<button>");
          before.before(button);
          button.addClass("background");
          button.append(tabData.name);
          button.attr("id", i);

          var remove = genIcon("remove").appendTo(button);
          remove.addClass("destroy");
          remove.attr("index", i);
          remove.click(function(){
            var button = $(this).parent();
            var index = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "remove-tab",
              confirm : "Delete Tab",
              click : function(ev, ui, inputs){
                button.remove();
                obj.data.templates.display.sheet.summary.splice(index, 1);
                obj.update();
              }
            });
          });

          button.click(function(){
            var tabData = obj.data.templates.display.sheet.summary[$(this).attr("id")];
            optionsLabel.children().each(function(){
              $(this).removeClass("highlight alttext");
              $(this).addClass("background");
            });
            $(this).addClass("highlight alttext");
            $(this).removeClass("background");

            optionsMenu.empty();
            var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
            display.addClass("fit-x");
            display.attr("targetApp", fakeSheet.attr("id"));
            display.attr("display", "templates.display.vehicle.summary."+$(this).attr("id")+".display");
            display.attr("path", "templates.display.vehicle.summary."+$(this).attr("id")+".display.");
            display.attr("markup", "vehicle"+$(this).attr("id"));
            display.css("position", "absolute");
            display.css("left", "0");
            display.css("top", "0");

            obj.addApp(display);
          });
          obj.update();
        }
        layout.coverlay("add-tab");
      });
      var pop = ui_popOut({
        target : $(this),
        id : "add-tab",
      }, content);
    });

    $(optionsLabel.children()[0]).click();
  });


  var dice = genIcon("registration-mark", "Dice Data").appendTo(sidebar);
  dice.click(function(){
    optionsLabel.text("Dice Data");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.dice");
    obj.addApp(select);
  });

  var actions = genIcon("picture", "Event Log Displays").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    optionsLabel.text("Event Log Displays");

    var content = sync.newApp("ui_diceDisplayBuilder");
    content.addClass("fit-xy");
    obj.addApp(content);

    optionsMenu.empty();
    content.appendTo(optionsMenu);
    content.css("position", "absolute");
    content.css("top", "0");
    content.css("left", "0");
  });

  var actions = genIcon("certificate", "Dice Effects").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    optionsLabel.text("Dice Effects");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.effects");
    obj.addApp(select);
  });

  var item = genIcon("briefcase", "Item Data").appendTo(sidebar);
  item.click(function(){
    optionsLabel.text("Item Data");
    optionsMenu.empty();
    sheetWrap.empty();

    var fakeSheet = sync.newApp("ui_fakeItem_wrap").appendTo(sheetWrap);
    fakeSheet.css("width", "600px");
    fakeSheet.css("min-height", "500px");
    obj.addApp(fakeSheet);

    var blacklist = {
      "info" : {blacklist : ["name", "img", "notes", "weight", "quantity"]},
      "equip" : {blacklist : ["armor"]},
      "weapon" : {blacklist : []},
      "spell" : {blacklist : []},
    }

    var characterWrap = sync.newApp("ui_dataModel").appendTo(optionsMenu);
    characterWrap.addClass("fit-xy");
    characterWrap.attr("blacklist", JSON.stringify(blacklist));
    characterWrap.attr("path", "templates.item");
    characterWrap.css("position", "absolute");
    characterWrap.css("left", "0");
    characterWrap.css("top", "0");
    obj.addApp(characterWrap);
  });

  var actions = genIcon("certificate", "Actions").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    optionsLabel.text("Actions");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.actions.i");
    obj.addApp(select);
  });

  var calc = genIcon("wrench", "Parameters").appendTo(sidebar);
  calc.css("margin-left", "1.5em");
  calc.css("font-size", "0.6em");
  calc.click(function(){
    optionsLabel.text("Item Parameters");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.item.params");
    obj.addApp(select);
  });

  var display = genIcon("list-alt", "Sheet").appendTo(sidebar);
  display.css("margin-left", "1.5em");
  display.css("font-size", "0.6em");
  display.click(function(){
    optionsLabel.text("Item Sheet");
    optionsMenu.empty();
    sheetWrap.empty();

    var fakeSheet = sync.newApp("ui_fakeItem_wrap").appendTo(sheetWrap);
    fakeSheet.css("width", "600px");
    fakeSheet.css("min-height", "500px");
    obj.addApp(fakeSheet);

    var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
    display.addClass("fit-x");
    display.attr("targetApp", fakeSheet.attr("id"));
    display.attr("display", "templates.display.item.summary");
    display.attr("path", "templates.display.item.summary.");
    display.attr("markup", "summary"+fakeSheet.attr("id"));
    display.css("position", "absolute");
    display.css("left", "0");
    display.css("top", "0");

    obj.addApp(display);
  });


  var page = genIcon("duplicate", "Page Data").appendTo(sidebar);
  page.addClass("dull");

  var actions = genIcon("tint", "Default Styling").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    obj.data.templates.page.info.img.modifiers = obj.data.templates.page.info.img.modifiers || {};
    optionsLabel.text("Page Styling");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.page.info.notes.modifiers");
    obj.addApp(select);
  });

/*
  var vehicle = genIcon("plane", "Vehicle Data").appendTo(sidebar);
  vehicle.click(function(){
    optionsLabel.text("Vehicle Data");
    optionsMenu.empty();

    var blacklist = {
      "info" : {blacklist : ["name", "img", "notes"]},
      "stats" : {blacklist : []},
      "counters" : {blacklist : []},
    }
    var characterWrap = sync.newApp("ui_dataModel").appendTo(optionsMenu);
    characterWrap.addClass("fit-xy");
    characterWrap.attr("blacklist", JSON.stringify(blacklist));
    characterWrap.attr("path", "templates.vehicle");
    characterWrap.css("position", "absolute");
    characterWrap.css("left", "0");
    characterWrap.css("top", "0");

    obj.addApp(characterWrap);
  });

  var actions = genIcon("certificate", "Actions").appendTo(sidebar);
  actions.css("margin-left", "1.5em");
  actions.css("font-size", "0.6em");
  actions.click(function(){
    optionsLabel.text("Actions");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.actions.v");
    obj.addApp(select);
  });

  var calc = genIcon("wrench", "Calculations").appendTo(sidebar);
  calc.css("margin-left", "1.5em");
  calc.css("font-size", "0.6em");
  calc.click(function(){
    optionsLabel.text("Calculations");
    optionsMenu.empty();

    obj.data.templates.display.sheet.calc = obj.data.templates.display.sheet.calc || [];

    var select = sync.newApp("ui_calcEditor").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.display.vehicle.calc");
    select.attr("structure", "templates.vehicle");
    obj.addApp(select);
  });

  var rules = genIcon("wrench", "Rules").appendTo(sidebar);
  rules.css("margin-left", "1.5em");
  rules.css("font-size", "0.6em");
  rules.click(function(){
    optionsLabel.text("Rules");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.display.vehicle.rules");
    obj.addApp(select);
  });

  var display = genIcon("plane", "Sheet").appendTo(sidebar);
  display.css("margin-left", "1.5em");
  display.css("font-size", "0.6em");
  display.click(function(){
    optionsLabel.empty();
    optionsMenu.empty();
    sheetWrap.empty();

    var fakeSheet = sync.newApp("ui_fakeVehicle_wrap").appendTo(sheetWrap);
    fakeSheet.attr("displayMode", 0);
    obj.addApp(fakeSheet);

    for (var i in obj.data.templates.display.vehicle.summary) {
      var tabData = obj.data.templates.display.vehicle.summary[i];
      var button = $("<button>").appendTo(optionsLabel);
      button.addClass("background");
      button.append(tabData.name);
      button.attr("id", i);

      var remove = genIcon("remove").appendTo(button);
      remove.addClass("destroy");
      remove.attr("index", i);
      remove.click(function(){
        var button = $(this).parent();
        var index = $(this).attr("index");
        ui_prompt({
          target : $(this),
          id : "remove-tab",
          confirm : "Delete Tab",
          click : function(ev, ui, inputs){
            obj.data.templates.display.vehicle.summary.splice(index, 1);
            obj.update();
          }
        });
      });

      button.click(function(){
        var tabData = obj.data.templates.display.vehicle.summary[$(this).attr("id")];
        optionsLabel.children().each(function(){
          $(this).removeClass("highlight alttext");
          $(this).addClass("background");
        });
        $(this).addClass("highlight alttext");
        $(this).removeClass("background");

        optionsMenu.empty();
        var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
        display.addClass("fit-x");
        display.attr("targetApp", fakeSheet.attr("id"));
        display.attr("display", "templates.display.vehicle.summary."+$(this).attr("id")+".display");
        display.attr("path", "templates.display.vehicle.summary."+$(this).attr("id")+".display.");
        display.attr("markup", "vehicle"+$(this).attr("id"));
        display.css("position", "absolute");
        display.css("left", "0");
        display.css("top", "0");

        obj.addApp(display);
      });
    }

    var addNew = genIcon("plus", "Add New Tab").appendTo(optionsLabel);
    addNew.addClass("lrpadding");
    addNew.click(function(){
      var before = $(this);

      var content = $("<div>");
      content.addClass("flexcolumn");

      content.append("<b>Name</b>");
      var name = genInput({
        parent : content,
        placeholder : "Enter Tab Name",
      });

      content.append("<b>Icon</b>");

      var icons = genInput({
        parent : content,
        placeholder : "Enter Icon Name",
      });
      icons.keyup(function(){
        icons.val(icons.val().replace("glyphicon", "").replace("glyphicon-", ""));
      });

      content.append("<a class='fit-x flexmiddle subtitle' href='https://getbootstrap.com/docs/3.3/components/' target='_blank'>Icon List</a>");

      var button = $("<button>").appendTo(content);
      button.append("Confirm");
      button.click(function(){
        if (name.val() || icons.val()) {
          obj.data.templates.display.vehicle.summary.push({
            name : name.val(),
            icon : icons.val(),
            display : []
          });

          var tabData = obj.data.templates.display.vehicle.summary[obj.data.templates.display.vehicle.summary.length-1];
          var button = $("<button>");
          before.before(button);
          button.addClass("background");
          button.append(tabData.name);
          button.attr("id", i);

          var remove = genIcon("remove").appendTo(button);
          remove.addClass("destroy");
          remove.attr("index", i);
          remove.click(function(){
            var button = $(this).parent();
            var index = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "remove-tab",
              confirm : "Delete Tab",
              click : function(ev, ui, inputs){
                button.remove();
                obj.data.templates.display.vehicle.summary.splice(index, 1);
                obj.update();
              }
            });
          });

          button.click(function(){
            var tabData = obj.data.templates.display.vehicle.summary[$(this).attr("id")];
            optionsLabel.children().each(function(){
              $(this).removeClass("highlight alttext");
              $(this).addClass("background");
            });
            $(this).addClass("highlight alttext");
            $(this).removeClass("background");

            optionsMenu.empty();
            var display = sync.newApp("ui_displayTree").appendTo(optionsMenu);
            display.addClass("fit-x");
            display.attr("targetApp", fakeSheet.attr("id"));
            display.attr("display", "templates.display.vehicle.summary."+$(this).attr("id")+".display");
            display.attr("path", "templates.display.vehicle.summary."+$(this).attr("id")+".display.");
            display.attr("markup", "vehicle"+$(this).attr("id"));
            display.css("position", "absolute");
            display.css("left", "0");
            display.css("top", "0");

            obj.addApp(display);
          });

          obj.update();
        }
        layout.coverlay("add-tab");
      });
      var pop = ui_popOut({
        target : $(this),
        id : "add-tab",
      }, content);
    });

    $(optionsLabel.children()[0]).click();
  });
*/
  var gameData = genIcon("cog", "Game Data").appendTo(sidebar);
  gameData.addClass("destroy");
  gameData.click(function(){
    ui_prompt({
      target : $(this),
      confirm : "Turn back! Unless you know what you are doing",
      click : function(){
        optionsLabel.text("Code Editor");
        optionsMenu.empty();

        var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
        select.addClass("fit-xy");
        select.attr("lookup", "templates");
        obj.addApp(select);
      }
    });
  });

  var library = genIcon("list-alt", "Content Library")//.appendTo(sidebar);
  library.css("margin-left", "1.5em");
  library.css("font-size", "0.6em");
  library.click(function(){
    optionsLabel.text("Content Library");
    optionsMenu.empty();

    var select = sync.newApp("ui_gameLibraries").appendTo(optionsMenu);
    select.addClass("fit-xy");
    obj.addApp(select);
  });

  var tags = genIcon("tags", "Tags").appendTo(sidebar);
  tags.css("margin-left", "1.5em");
  tags.css("font-size", "0.6em");
  tags.click(function(){
    optionsLabel.text("Tags");
    optionsMenu.empty();

    var select = sync.newApp("ui_manageTags").appendTo(optionsMenu);
    select.addClass("fit-xy");
    obj.addApp(select);
  });

  var gameCssStyling = genIcon("tint", "Layout Styling").appendTo(sidebar);
  gameCssStyling.css("margin-left", "1.5em");
  gameCssStyling.css("font-size", "0.6em");
  gameCssStyling.click(function(){
    optionsLabel.text("Layout Styling");
    optionsMenu.empty();

    var content = $("<div>").appendTo(optionsMenu);
    content.addClass("flexcolumn fit-xy");

    var temp = obj.data.templates.styling || {
      foreground : "rgb(33,46,55)",
      background : "rgb(44,57,66)",
      highlight : "rgb(190,4,15)",
      highlight2 : "rgb(230,44,55)",
      hover1 : "rgb(190,4,15)",
      hover2 : "rgb(230,44,55)",
      focus : "rgb(230,44,55)",
      create : "rgb(66,138,66)",
      destroy : "rgb(190,4,15)",
    };

    var navBar = genNavBar(null, "flex");
    navBar.addClass("fit-x flex");
    navBar.appendTo(content);
    navBar.generateTab("Basic", "user", function(parent) {
      temp = {
        foreground : "rgb(33,46,55)",
        background : "rgb(44,57,66)",
        highlight : "rgb(190,4,15)",
        highlight2 : "rgb(230,44,55)",
        hover1 : "rgb(190,4,15)",
        hover2 : "rgb(230,44,55)",
        focus : "rgb(230,44,55)",
        create : "rgb(66,138,66)",
        destroy : "rgb(190,4,15)",
      }

      function update(color, key) {
        if (key == "foreground") {
          color.attr("style", `
          background: none;
          background-color: `+temp["foreground"]+`;
          `);
        }
        else if (key == "background") {
          color.attr("style", `background: linear-gradient(to top, `+temp["foreground"]+`, `+temp["background"]+`);`);
        }
        else if (key == "highlight") {
          color.attr("style", `background: linear-gradient(to top, `+temp["highlight"]+`, `+temp["highlight2"]+`);`);
        }
        else if (key == "highlight2") {
          color.attr("style", `background-color: `+temp["highlight2"]+`;`);
        }
        else if (key == "hover1") {
          color.attr("style", `            	color: white;
                        border-radius: 2px;
                        background-color: `+temp["hover1"]+`;
                        outline-color: `+temp["hover1"]+`;
                        cursor : pointer;`);
        }
        else if (key == "hover2") {
          color.attr("style", `            	color: white;
                        border-radius: 2px;
                        background-color: `+temp["hover2"]+`;
                        outline-color: `+temp["hover2"]+`;
                        cursor : pointer;`);
        }
        else if (key == "focus") {
          color.attr("style", `box-shadow: inset 0 0 0.5em `+temp["focus"]+`;`);
        }
        else if (key == "create") {
          color.attr("style", `color: `+temp["create"]+`;
          -webkit-text-fill-color: `+temp["create"]+`;`);
        }
        else if (key == "combat") {
          color.attr("style", `            	color: `+temp["combat"]+`;
                        -webkit-text-stroke-color: rgb(255,255,255);
                        -webkit-text-fill-color: `+temp["combat"]+`;`);
        }
        else if (key == "destroy") {
          color.attr("style", `            	color: `+temp["destroy"]+`;
                        -webkit-text-fill-color: `+temp["destroy"]+`;`);
        }
      }

      var optionsWrap = $("<div>").appendTo(parent);
      optionsWrap.addClass("padding flexrow flexwrap flexaround");

      for (var key in temp) {
        var option = $("<div>").appendTo(optionsWrap);
        option.addClass("spadding outline flexcolumn flexmiddle");

        var b = $("<b>").appendTo(option);
        b.text(key);

        var color = $("<div>").appendTo(option);
        color.attr("key", key);
        color.addClass("smooth lpadding hover");
        color.text("text");
        update(color, key);
        color.click(function(){
          var key = $(this).attr("key");
          var col = $(this);

          var colorPicker = sync.render("ui_colorPicker")(obj, app, {
            hideColor : true,
            update : true,
            colorChange : function(ev, ui, col){
              temp[key] = col;
              optionsWrap.children().each(function(){
                update($($(this).children()[1]), $($(this).children()[1]).attr("key"));
              });
            }
          }).addClass("flexmiddle flex");
          var pop = ui_popOut({
            target : $(this),
            id : "color",
            align : "bottom",
          }, colorPicker);
        });
      }
    });

    navBar.generateTab("Advanced", "cog", function(parent) {
      var textarea = $("<textarea>").appendTo(parent);
      textarea.addClass("flex");
      if (temp instanceof Object) {
        temp = obj.data.templates.styling || `
        .foreground {
          background: none;
          background-color: `+temp["foreground"]+`;
        }

        .background {
          background: linear-gradient(to top, `+temp["foreground"]+`, `+temp["background"]+`);
        }

        .highlight {
          background: linear-gradient(to top, `+temp["highlight"]+`, `+temp["highlight2"]+`);
        }

        .highlight2 {
          background-color: `+temp["highlight2"]+`;
        }

        .create {
          color: `+temp["create"]+`;
          -webkit-text-fill-color: `+temp["create"]+`;
        }

        .combat {
          color: `+temp["combat"]+`;
          -webkit-text-stroke-color: rgb(255,255,255);
          -webkit-text-fill-color: `+temp["combat"]+`;
        }

        .destroy {
          color: `+temp["destroy"]+`;
          -webkit-text-fill-color: `+temp["destroy"]+`;
        }

        .focus {
          box-shadow: inset 0 0 0.5em `+temp["focus"]+`;
        }

        .hover1:hover {
          color: white;
          border-radius: 2px;
          background-color: `+temp["hover1"]+`;
          outline-color: `+temp["hover1"]+`;
          cursor : pointer;
        }

        .hover2:hover {
          color: white;
          border-radius: 2px;
          background-color: `+temp["hover2"]+`;
          outline-color: `+temp["hover2"]+`;
          cursor : pointer;
        }
        `;
      }
      textarea.val(temp);
      textarea.change(function(){
        temp = textarea.val();
      });
    });

    navBar.selectTab("Basic");

    var button = $("<button>").appendTo(content);
    button.append("<b>Confirm</b>");
    button.click(function(){
      if (temp instanceof Object) {
        temp = obj.data.templates.styling || `
        .foreground {
          background: none;
          background-color: `+temp["foreground"]+`;
        }

        .background {
          background: linear-gradient(to top, `+temp["foreground"]+`, `+temp["background"]+`);
        }

        .highlight {
          background: linear-gradient(to top, `+temp["highlight"]+`, `+temp["highlight2"]+`);
        }

        .highlight2 {
          background-color: `+temp["highlight2"]+`;
        }

        .create {
          color: `+temp["create"]+`;
          -webkit-text-fill-color: `+temp["create"]+`;
        }

        .combat {
          color: `+temp["combat"]+`;
          -webkit-text-stroke-color: rgb(255,255,255);
          -webkit-text-fill-color: `+temp["combat"]+`;
        }

        .destroy {
          color: `+temp["destroy"]+`;
          -webkit-text-fill-color: `+temp["destroy"]+`;
        }

        .focus {
          box-shadow: inset 0 0 0.5em `+temp["focus"]+`;
        }

        .hover1:hover {
          color: white;
          border-radius: 2px;
          background-color: `+temp["hover1"]+`;
          outline-color: `+temp["hover1"]+`;
          cursor : pointer;
        }

        .hover2:hover {
          color: white;
          border-radius: 2px;
          background-color: `+temp["hover2"]+`;
          outline-color: `+temp["hover2"]+`;
          cursor : pointer;
        }
        `;
      }
      obj.data.templates.styling = temp;
    });
  });

  var tables = genIcon("th-list", "Tables").appendTo(sidebar);
  tables.css("margin-left", "1.5em");
  tables.css("font-size", "0.6em");
  tables.click(function(){
    optionsLabel.text("Table Editor");
    optionsMenu.empty();

    var select = sync.newApp("ui_tableEditor").appendTo(optionsMenu);
    select.addClass("fit-xy");
    obj.addApp(select);
  });

  var tables = genIcon("th-list", "Constants").appendTo(sidebar);
  tables.css("margin-left", "1.5em");
  tables.css("font-size", "0.6em");
  tables.click(function(){
    optionsLabel.text("Constants");
    optionsMenu.empty();

    var select = sync.newApp("ui_JSON").appendTo(optionsMenu);
    select.addClass("fit-xy");
    select.attr("lookup", "templates.constants");
    obj.addApp(select);
  });

  $("<div>").addClass("flex").appendTo(sidebar);

  var optionsBar = $("<div>").appendTo(sidebar);
  optionsBar.addClass("flexcolumn");
  optionsBar.css("color", "#333");
  optionsBar.css("font-size", "0.5em");

  var button = $("<button>").appendTo(optionsBar);
  button.append("Update Existing Assets");
  button.click(function(){
    var content = $("<div>");
    content.addClass("flexcolumn flexmiddle");
    content.append("<div class='flexmiddle'><b>This will alter all existing characters, are you sure?</b></div>");

    var button = $("<button>").appendTo(content);
    button.append("Yes");
    button.click(function(){
      game.templates;
      for (var i in game.entities.data) {
        var ent = game.entities.data[i];
        if (ent.data && ent.data._t == "c") {

          if (game.templates.display.sheet.health) {
            sync.traverse(ent.data, game.templates.display.sheet.health, ent.data.counters.wounds);
          }

          merge(ent.data.info, game.templates.character.info);
          merge(ent.data.counters, game.templates.character.counters);
          merge(ent.data.stats, game.templates.character.stats);
          for (var j in ent.data.inventory) {
            merge(ent.data.inventory[j], game.templates.item);
          }
          var newTalents = {};
          for (var j in ent.data.talents) {
            ent.data.talents = ent.data.talents || {};
            newTalents[j] = ent.data.talents[j];
          }
          game.entities.data[i].data.talents = newTalents;

          var newSpecials = {};
          for (var j in ent.data.specials) {
            ent.data.specials = ent.data.specials || {};
            newSpecials[j] = ent.data.specials[j];
          }
          game.entities.data[i].data.specials = newSpecials;

          var newSkills = duplicate(game.templates.character.skills);
          for (var j in ent.data.skills) {
            ent.data.skills = ent.data.skills || {};
            var found = false;
            for (var k in newSkills) {
              if (ent.data.skills[j].name.toLowerCase() == newSkills[k].name.toLowerCase()) {
                newSkills[k] = ent.data.skills[j];
                found = true;
                break;
              }
            }
            if (!found) {
              newSkills[(Object.keys(newSkills).length || 0)] = ent.data.skills[j];
            }
          }
          game.entities.data[i].data.skills = newSkills;

          for (var j in ent.data.traits) {
            ent.data.tags = ent.data.tags || {};
            ent.data.tags["trait_"+ent.data.traits[j].name] = 1;
          }
          for (var j in ent.data.proficient) {
            ent.data.tags = ent.data.tags || {};
            ent.data.tags["prof_"+j] = 1;
          }
          ent.sync("updateAsset");
        }
        else if (ent.data && ent.data._t == "g") {
          ent.sync("deleteAsset");
        }
        else if (ent.data && ent.data._t == "v") {
          merge(ent.data.info, game.templates.vehicle.info);
          merge(ent.data.counters, game.templates.vehicle.counters);
          merge(ent.data.stats, game.templates.vehicle.stats);
          for (var j in ent.data.inventory) {
            merge(ent.data.inventory[j], game.templates.item);
          }
          ent.sync("updateAsset");
        }
      }
      layout.coverlay("confirm-template");
    });

    var button = $("<button>").appendTo(content);
    button.append("No");
    button.click(function(){
      layout.coverlay("confirm-template");
    });

    ui_popOut({
      target : $(this),
      id : "confirm-template",
    }, content);
  });

  var button = $("<button>").appendTo(optionsBar);
  button.addClass("highlight alttext");
  button.append("Save New Templates");
  button.click(function(){
    var button = $("<button>");
    button.append("Confirm (Can't be undone)");
    button.click(function(){
      runCommand("updateTemplate", duplicate(obj.data.templates));
      layout.coverlay("confirm-template");
    });

    ui_popOut({
      target : $(this),
      id : "confirm-template",
    }, button);
  });

  var button = $("<button>").appendTo(optionsBar);
  button.addClass("focus");
  button.append("RESTORE ORIGNAL TEMPLATES");
  button.click(function(){
    if (game.locals["gameList"][game.config.data.game]) {
      runCommand("updateTemplate", duplicate(game.locals["gameList"][game.config.data.game].templates));
    }
    else {
      sendAlert({text : "This is a custom game, can't restore templates(still being built)"});
    }
  });

  var curButton = $("<button>")//.appendTo(optionsBar);
  curButton.addClass("alttext highlight");
  var download = genIcon("cloud-download", (data.name || "[Unnamed Template]")).appendTo(curButton);
  download.css("pointer-events", "none");
  curButton.click(function(){
    var content = $("<div>");
    content.addClass("flexcolumn");
    for (var i in game.locals["storage"].data.l) {
      if (game.locals["storage"].data.l[i] instanceof Object) {
        if (game.locals["storage"].data.l[i].a == "t") {
          var template = $("<button>").appendTo(content);
          template.text((game.locals["storage"].data.l[i].n || "[Unnamed Template]"));
          template.attr("index", i);
          template.attr("name", (game.locals["storage"].data.l[i].n || "[Unnamed Template]"));
          template.attr("_uid", game.locals["storage"].data.l[i]._uid);
          template.click(function(){
            curButton.empty();
            var icon = genIcon("cloud-download", $(this).attr("name")).appendTo(curButton);
            icon.css("pointer-events", "none");
            data.templates = game.locals["storage"].data.s[$(this).attr("_uid")].data;
            data._uid = $(this).attr("_uid");
            data.name = $(this).attr("name");
            obj.update();
            layout.coverlay("template-list");
          });
        }
      }
    }

    var popout = ui_popOut({
      target : $(this),
      align : "top",
      id : "template-list"
    }, content);
  });

  var button = $("<button>")//.appendTo(optionsBar);
  button.addClass("alttext highlight");
  if (!data._uid) {
    button.append(genIcon("cloud-upload", "Save Into Asset Storage").css("pointer-events", "none"));
  }
  else {
    button.append(genIcon("cloud-upload", "Update Template").css("pointer-events", "none"));
  }
  button.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {"Template Name" : data.name || ""},
      click : function(ev, inputs) {
        data.templates.name = inputs["Template Name"].val();
        data.templates._uid = data._uid;
        runCommand("storeTemplate", duplicate(data.templates));
      }
    });

    //runCommand("updateTemplate", duplicate(data.templates));
  });
  if (data._uid) {
    var exportWrap = $("<div>").appendTo(optionsBar);
    exportWrap.addClass("flexmiddle");

    var exportLink = genIcon("cloud-upload", "Share Homebrew Game").appendTo(exportWrap);
    exportLink.addClass("alttext");
    exportLink.click(function(){
      var options = $("<div>");
      options.addClass("flexcolumn flex");

      game.locals["marketSubmission"] = sync.dummyObj();
      game.locals["marketSubmission"].data = {info : {
        name : sync.newValue("Name", data.name),
        img : sync.newValue("Image"),
        notes : sync.newValue("Notes", "Enter your entry details here")}
      };

      var dummy = game.locals["marketSubmission"];

      var newApp = sync.newApp("ui_editPage");
      newApp.addClass("flex");
      newApp.css("padding", "1em");
      newApp.appendTo(options);
      dummy.addApp(newApp);

      var form = $("<div>").appendTo(options);
      form.addClass("flexcolumn");
      form.append("<b>iframe redirect?</b>");

      var url = genInput({
        parent : form,
        placeholder : "Leave blank to use the description above or enter URL",
      });
      url.change(function(){
        expanded.empty();
        if ($(this).val()) {
          game.locals["marketSubmission"].data.info.notes.name = "url";
          expanded.append("<iframe src='"+$(this).val()+"' width='"+expanded.width()+"' height='"+($(document).height() * 0.65)+"'>");
          game.locals["marketSubmission"].update();
        }
        else if (cObj.data.info.notes.name != "url") {
          game.locals["marketSubmission"].data.info.notes.name = "Notes";
          expanded.append(sync.render("ui_renderPage")(cObj, app, {viewOnly : true}).removeClass("outline"));
          game.locals["marketSubmission"].update();
        }
      });

      form.append("<p style='font-size:0.8em;'>URL redirect can move users to your own site, or show something more complicated than what the page editor can support.</p>");

      var wrap = $("<div>").appendTo(form);
      wrap.addClass("flexmiddle");
      wrap.css("display", "inline-block");

      var checkbox = genInput({
        parent : wrap,
        type : "checkbox",
        style : {"margin" : "0"},
        disabled : "true",
      }).appendTo(wrap);
      wrap.append("<b>Quality Content</b>");

      var wrap = $("<div>").appendTo(form);
      wrap.addClass("flexmiddle");
      wrap.css("display", "inline-block");

      var checkbox = genInput({
        parent : wrap,
        type : "checkbox",
        style : {"margin" : "0"}
      }).appendTo(wrap);
      checkbox.attr("checked", "true");
      wrap.append("<b>Community Content</b>");

      var butt = $("<button>").appendTo(form);
      butt.append("Confirm Submission");
      butt.addClass("flexmiddle");
      butt.click(function(){
        // converts to an actual inventory (has to be done this way)
        runCommand("listAsset", {id : getCookie("UserID")+"_"+data._uid, data : game.locals["marketSubmission"].data});
        //layout.coverlay("market-submission", 500);
      });
      var popout = ui_popOut({
        id : "market-submission",
        target : $(this),
        style : {"width" : "30vw"},
      }, options);
    });
  }

  var preview = $("<div>").appendTo(row);
  preview.addClass("flexcolumn");

  var sheetWrap = $("<div>").appendTo(preview);
  sheetWrap.css("overflow", "auto");
  sheetWrap.css("position", "relative");

  var fakeSheet = sync.newApp("ui_fakeSheet_wrap").appendTo(sheetWrap);
  obj.addApp(fakeSheet);

  var options = $("<div>").appendTo(row);
  options.addClass("flex flexcolumn padding foreground");

  var optionsLabel = $("<b class='alttext'>Options</b>").appendTo(options);

  var optionsMenu = $("<div>").appendTo(options);
  optionsMenu.addClass("flex white smooth");
  optionsMenu.css("position", "relative");
  optionsMenu.css("overflow", "auto");

  return div;
});
