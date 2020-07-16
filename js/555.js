/*
  To do:
  * Button
  * Label
  * Tabs
  * Group fields
  * Geolocalización
  * DateTime
  * Switch
  * Buttons
  * Color
  * Picture
  * Label lookup. Es decir, que en una etiqueta se despliegue el valor de un campo
  * Lookup. Hacer lookup a tablas, fields y display field para el Parent
  * Lookup. Cargar los datos del parent para seleccionar el default
  * Al cambiar el valor del widget, que cambie el default
*/

var
    wID = 0,
    wAct = 0,
    forms = [],
    fID = 0,
    fAct = 0,
    lastEdit = -1,
    grid = GridStack.init({
        cellHeight: 45,
        float: true,
        animate: true,
        verticalMargin: 0,
        column: 12
    });

function ShowButtons(numCtl) {
    if ($("#trash").length) return;
    var liCtl = "#wg" + numCtl;
    $(liCtl).append('<button id="copy" class="btnEdit" title="Duplicate"><i class="fa fa-copy"></i></button><button id="trash" class="btnEdit" title="Delete"><i class="fa fa-trash-o"></i></button>');
    $("#trash").click(function(event) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: "red",
            cancelButtonText: 'No, cancel!',
            cancelButtonColor: "green",
            focusCancel: true,
            reverseButtons: false
        }).then((result) => {
            if (result.value) {
                grid.removeWidget($("#wg" + numCtl));
                forms[fAct].ctls[numCtl] = {
                    deleted: true
                };
                var und = forms[fAct].ctls.findIndex(function(item) {
                    return item.deleted == false;
                });
                if (und != -1) {
                    edit(und);
                } else {
                    $("#tabs li:first-child").addClass("disabled");
                    M.Tabs.getInstance($("#tabs")).select("formTab");
                }
            }
        });
    });
    $("#copy").click(function(event) {
        event.stopPropagation();
        var elem = {};
        for (let prop in forms[fAct].ctls[numCtl]) {
            elem[prop] = forms[fAct].ctls[numCtl][prop];
        }
        forms[fAct].ctls.push(elem);
        var i = forms[fAct].ctls.length - 1;
        forms[fAct].ctls[i].field = "field" + i;
        var wh = grid.engine.nodes.find(function(item) {
            return item.id == numCtl
        });
        creaWidget(forms[fAct].ctls[i].type, false, {
            widget: forms[fAct].ctls[i],
            x: 0,
            y: grid.engine.getRow(),
            width: wh.width,
            height: wh.height
        });
    });
}

function defValchangeCmb(ctl) {
    var y = $("#defVal li.selected")[0].textContent;
    forms[fAct].ctls[wAct].defaultValue = $("#defaultValue option").filter(function(a, b) {
        if ($(b)[0].text == y) return a + "";
    })[0].value;
    $("#" + ctl + wAct + " option[value='" + forms[fAct].ctls[wAct].defaultValue + "']").prop("selected", true)
    M.FormSelect.init($("#" + ctl + wAct));
}

function creaCombo(id) {
    $("#listValues + label").html("List Values");
    forms[fAct].ctls[wAct].listValues = $("#listValues").val();
    $("#defVal").children().remove();
    var st = '';
    var lv = forms[fAct].ctls[id].listValues.split("\n");
    for (var i = 0; i < lv.length; i++) st += '<option value="' + i + '"' + ((forms[fAct].ctls[id].defaultValue == i) ? " selected" : "") + '>' + lv[i] + '</option>';
    st += '</select>';
    $("#defVal").prepend('<select id="defaultValue" onchange="defValchangeCmb(\'combo\')">' + st + '<label for="defaultValue">Default value</label>');
    M.FormSelect.init($('#defaultValue'));
    $("#wg" + id + " .input-field").remove();
    $('<div class="input-field"><select id="combo' + id + '">' + st + '<label><i class="fa fa-caret-square-o-down"></i> ' + forms[fAct].ctls[id].caption + ((forms[fAct].ctls[id].Required) ? '<span class="req">*</span>' : '') + '</label>' + '</div>').appendTo("#wg" + id + " .grid-stack-item-content");
    M.FormSelect.init($('#combo' + id));
    $("#listValues").off().on("keyup", function(e) {
        creaCombo(wAct);
    });
}

function creaOptions(id) {
    $("#listValues + label").html("List Values");
    forms[fAct].ctls[wAct].listValues = $("#listValues").val();
    $("#defVal").children().remove();
    $("#placeholder, #placeholder + label").hide();
    var st = '';
    var lv = forms[fAct].ctls[id].listValues.split("\n");
    for (var i = 0; i < lv.length; i++) st += '<p><label><input name="grp' + id + '" type="radio"' + ((forms[fAct].ctls[id].defaultValue == i) ? " checked" : "") + ' value="' + i + '" /><span>' + lv[i] + '</span></label></p>';
    $("#defVal").prepend('<label>Default value</label><br/>' + st);
    $('#defVal input[value="' + forms[fAct].ctls[id].defaultValue + '"]').prop("checked", true);
    $("#wg" + id + " .input-field").remove();
    $("<div class='input-field'><label><i class='fa fa-caret-square-o-down'></i> " + forms[fAct].ctls[id].caption + ((forms[fAct].ctls[id].Required) ? '<span class="req">*</span>' : '') + "</label><br/>" + st.replace(/grp/g, "dgrp") + '</div>').appendTo("#wg" + id + " .grid-stack-item-content");
    $("#defVal input[name^='grp']").on("change", function(a) {
        forms[fAct].ctls[id].defaultValue = $("#defVal input:checked").val();
        $("#wg" + id + " input[name='dgrp" + id + "'][value=" + forms[fAct].ctls[id].defaultValue + "]").prop("checked", true);
    });
    $("#listValues").off().on("keyup", function() {
        creaOptions(wAct);
    });
}

function creaDateTime(id) {
    $("#defVal, #validation").children().remove();
    $("#wg" + id + " .input-field").remove();
    var t = (forms[fAct].ctls[id].sType == "Time") ? "timepicker" : "datepicker";
    $('<input id="defaultValue" type="text" class="' + t + '"></input><label for="defaultValue">Default value</label>').appendTo("#defVal");
    $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="text" class="' + t + '" /><label for="minValue">Min value</label></div>' +
        '<div class="input-field"><input id="minMsg" type="text"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="text" class="' + t + '" />' +
        '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
    $('<div class="input-field"><input id="dateTime' + id + '" type="text" class="' + t + ' validate"><label for="dateTime' + id + '"><i class="fa fa-' + ((t == "datepicker") ? "calendar" : "clock") + '-o"></i> ' + forms[fAct].ctls[id].caption + ((forms[fAct].ctls[id].Required) ? '<span class="req">*</span>' : '') + "</label></div>").appendTo("#wg" + id + " .grid-stack-item-content");
    $("#dateTime" + id).val(forms[fAct].ctls[id].defaultValue);
    if (t == "datepicker") {
        M.Datepicker.init($("#defaultValue, #minValue, #maxValue, #dateTime" + id));
    } else {
        M.Timepicker.init($("#defaultValue, #minValue, #maxValue, #dateTime" + id));
    }
    $("#defaultValue").val(forms[fAct].ctls[id].defaultValue);
    $("#placeholder + label, #placeholder, #Mask, #Mask + label, #validation").show();
    $("#placeholder").trigger("keyup");
    minMaxKey();
    $("#defaultValue").off().on("keyup change", function() {
        forms[fAct].ctls[wAct].defaultValue = $("#defaultValue").val();
        $("#wg" + wAct + " input").val(forms[fAct].ctls[wAct].defaultValue);
        M.updateTextFields();
    });
}

function creaNumber(id) {

    function formatMoney(elem, val) {
        $(elem).prop("type", "text");
        var n = new Intl.NumberFormat("sp-MX", {
            style: "currency",
            minimumFractionDigits: forms[fAct].ctls[wAct].decimal,
            currency: "mxn"
        }).format(val);
        $(elem).val(n);
        M.updateTextFields(elem);
    }

    $("#defVal, #validation").children().remove();
    $('<input id="defaultValue" type="number" class="validate"></input><label for="defaultValue">Default Value</label>').appendTo("#defVal");
    $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="number" /><label for="minValue">Min value</label></div>' +
        '<div class="input-field"><input id="minMsg" type="text"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="number" />' +
        '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
    $("#decimal").val(forms[fAct].ctls[id].decimal);
    $("#defaultValue").val(forms[fAct].ctls[id].defaultValue);
    $("#decimal + label, #decimal, #placeholder + label, #placeholder, #Mask, #Mask + label, #validation").show();
    $("#placeholder").trigger("keyup");
    minMaxKey();
    if (forms[fAct].ctls[id].sType == "Money") {
        formatMoney("#defaultValue", forms[fAct].ctls[wAct].defaultValue);
        formatMoney("#minValue", forms[fAct].ctls[wAct].minValue);
        formatMoney("#maxValue", forms[fAct].ctls[wAct].maxValue);
        formatMoney("#wg" + wAct + " input", forms[fAct].ctls[wAct].defaultValue);
        $("#defaultValue").on("focus", function() {
            $("#defaultValue").prop("type", "number");
            $("#defaultValue").val(forms[fAct].ctls[wAct].defaultValue.replace(/\$|,/g, ''));
        });
        $("#defaultValue").on("blur", function() {
            formatMoney("#defaultValue", forms[fAct].ctls[wAct].defaultValue);
        });
        $("#minValue").on("focus", function() {
            $("#minValue").prop("type", "number");
            $("#minValue").val(forms[fAct].ctls[id].minValue.replace(/\$|,/g, ''));
        });
        $("#minValue").on("blur", function() {
            formatMoney("#minValue", forms[fAct].ctls[id].minValue);
        });
        $("#maxValue").on("focus", function() {
            $("#maxValue").prop("type", "number");
            $("#maxValue").val(forms[fAct].ctls[id].maxValue.replace(/\$|,/g, ''));
        });
        $("#maxValue").on("blur", function() {
            formatMoney("#maxValue", forms[fAct].ctls[id].maxValue);
        });
        $("#number" + id).on("focus", function() {
            edit(id);
            $("#number" + id).prop("type", "number");
            $("#number" + id).val(forms[fAct].ctls[id].defaultValue.replace(/\$|,/g, ''));
        });
        $("#number" + id).on("blur", function() {
            formatMoney("#number" + id, forms[fAct].ctls[id].defaultValue);
        });
    } else {
        $("#wg" + id + " input").prop("type", "number").val(forms[fAct].ctls[id].defaultValue);
    }
    M.updateTextFields("#defaultValue, #minValue, #maxValue, #wg" + wAct + " input");
    $("#defaultValue").on("keyup change", function() {
        forms[fAct].ctls[wAct].defaultValue = $("#defaultValue").val();
        if (forms[fAct].ctls[wAct].sType == "Money") {
            formatMoney("#wg" + wAct + " input", forms[fAct].ctls[wAct].defaultValue);
        } else {
            $("#wg" + wAct + " input").val(forms[fAct].ctls[wAct].defaultValue);
        }
        M.updateTextFields("#defaultValue, #wg" + wAct + " input");
    });
    $("#decimal").on("keyup change", function() {
        forms[fAct].ctls[wAct].decimal = $("#decimal").val();
        $("#defaultValue, #minValue, #maxValue, #number" + id).attr("step", "0." + ("000000000000000" + parseInt(forms[fAct].ctls[wAct].decimal)).substr(0, parseInt(forms[fAct].ctls[wAct].decimal) - 1) + 1);
        if (forms[fAct].ctls[wAct].sType == "Money") {
            formatMoney("#defaultValue", forms[fAct].ctls[wAct].defaultValue);
            formatMoney("#minValue", forms[fAct].ctls[wAct].minValue);
            formatMoney("#maxValue", forms[fAct].ctls[wAct].maxValue);
            formatMoney("#wg" + wAct + " input", forms[fAct].ctls[wAct].defaultValue);
        }
    });
}

function creaLookup(id) {
    $("#defVal").children().remove();
    forms[fAct].ctls[id].listValues = "";
    var st = '';
    var lv = forms[fAct].ctls[id].listValues.split("\n");
    for (var i = 0; i < lv.length; i++) st += '<option value="' + i + '"' + ((forms[fAct].ctls[id].defaultValue == i) ? " selected" : "") + '>' + lv[i] + '</option>';
    st += '</select>';
    $("#defVal").prepend('<div class="input-field"><input id="parentT" type="text" class="validate" /><label for="parentT">Parent Table</label></div>' +
        '<div class="input-field"><input id="parentF" type="text" class="validate" /><label for="parentF">Parent Field</label></div>' +
        '<div class="input-field"><input id="displayF" type="text" class="validate" /><label for="displayF">Display Field</label></div>' +
        '<div class="input-field"><select id="defaultValue" onchange="defValchangeCmb(\'lookup\')">' +
        st + '<label for="defaultValue">Default value</label></div>');
    M.FormSelect.init($('#defaultValue'));
    $("#wg" + id + " .input-field").remove();
    $('<div class="input-field"><select id="lookup' + id + '">' + st + '<label><i class="fa fa-database"></i> ' + forms[fAct].ctls[id].caption + ((forms[fAct].ctls[id].Required) ? '<span class="req">*</span>' : '') + '</label>' + '</div>').appendTo("#wg" + id + " .grid-stack-item-content");
    M.FormSelect.init($('#lookup' + id));
    $("#parentT").val(forms[fAct].ctls[wAct].parentTable);
    $("#parentF").val(forms[fAct].ctls[wAct].parentField);
    $("#displayF").val(forms[fAct].ctls[wAct].displayField);
    $("#parentT").on("keyup", function() {
        forms[fAct].ctls[wAct].parentTable = $("#parentT").val();
    });
    $("#parentF").on("keyup", function() {
        forms[fAct].ctls[wAct].parentField = $("#parentF").val();
    });
    $("#displayF").on("keyup", function() {
        forms[fAct].ctls[wAct].displayField = $("#displayF").val();
    });
}

function creaGrid(id) {
    $("#listValues + label").html("Column ^ Field");
    $("#table" + id).children().remove();
    $("#listValues").val(forms[fAct].ctls[id].listValues);
    var st = '',
        cols = '',
        lv = forms[fAct].ctls[id].listValues.split("\n");
    for (var i = 0; i < lv.length; i++) {
        st += '<th>' + lv[i].split("^")[0].trim() + '</th>';
        cols += "<td>Data X." + (i + 1) + "</td>";
    }
    st = "<thead><tr>" + st + "</tr></thead><tbody>";
    for (var i = 1; i <= 3; i++) st += '<tr>' + cols.replace(/X/g, i) + '</tr>';
    $(st + "</tbody>").appendTo("#table" + id);
    $("#listValues").off().on("keyup", function(e) {
        forms[fAct].ctls[wAct].listValues = $("#listValues").val();
        creaGrid(wAct);
    });
}

function edit(id) {
    if (lastEdit == id) return;
    if (lastEdit != -1) $("#wg" + lastEdit).removeClass("fldActive");
    $("#defVal, #validation").children().remove();
    $('<label for="defaultValue">Default value</label>').appendTo("#defVal");
    $("#wg" + id).addClass("fldActive");
    wAct = id;
    lastEdit = id;
    $("#field").val(forms[fAct].ctls[id].field);
    $("#caption").val(forms[fAct].ctls[id].caption);
    showHideOptional();
    $("#reqMsg").val(forms[fAct].ctls[id].reqMsg);
    showEnabled();
    showVisible();
    $("#tooltip").val(forms[fAct].ctls[id].tooltip);
    $("#wg" + wAct).prop("title", forms[fAct].ctls[wAct].tooltip);
    $("#placeholder").val(forms[fAct].ctls[id].placeholder);
    $("#help").val(forms[fAct].ctls[id].help);
    if (forms[fAct].ctls[id].type == "Text") {
        switch (forms[fAct].ctls[wAct].sType) {
            case "Text":
                $('<input id="defaultValue" type="text"></input>').appendTo("#defVal");
                $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="text" /><label for="minValue">Min value</label></div>' +
                    '<div class="input-field"><input id="minMsg" type="text"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="text" />' +
                    '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
                break;
            case "Password":
                $('<input id="defaultValue" type="password"></input>').appendTo("#defVal");
                $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="password" /><label for="minValue">Min value</label></div>' +
                    '<div class="input-field"><input id="minMsg" type="text"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="password" />' +
                    '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
                break;
            case "Phone":
                $('<input id="defaultValue" type="tel"></input>').appendTo("#defVal");
                break;
            case "Email":
                $('<input id="defaultValue" type="email"></input>').appendTo("#defVal");
                break;
            case "URL":
                $('<input id="defaultValue" type="url"></input>').appendTo("#defVal");
                break;
        }
        $("#defaultValue").val(forms[fAct].ctls[id].defaultValue);
        $("#placeholder + label, #placeholder, #Mask, #Mask + label, #validation").show();
        $("#placeholder").trigger("keyup");
        $("#defaultValue").on("keyup", function() {
            forms[fAct].ctls[wAct].defaultValue = $("#defaultValue").val();
            $("#wg" + wAct + " input").val(forms[fAct].ctls[wAct].defaultValue);
            M.updateTextFields();
        });
    }
    if (forms[fAct].ctls[id].type == "Memo") {
        $('<textarea id="defaultValue" class="materialize-textarea"></textarea>').appendTo("#defVal");
        $("#defaultValue").val(forms[fAct].ctls[id].defaultValue);
        $("#Mask, #Mask + label, #validation").hide();
        $("#placeholder + label, #placeholder").show();
        $("#placeholder").trigger("keyup");
        M.textareaAutoResize($("#defaultValue"));
        $("#defaultValue").on("keyup", function() {
            forms[fAct].ctls[wAct].defaultValue = $("#defaultValue").val();
            $("#wg" + wAct + " textarea").val(forms[fAct].ctls[wAct].defaultValue);
            M.textareaAutoResize($("#wg" + wAct + " textarea"));
            M.updateTextFields();
        });
    }
    if (forms[fAct].ctls[id].type == "Number") {
        creaNumber(id);
    } else {
        $("#decimal + label, #decimal").hide();
    }
    if (forms[fAct].ctls[id].type == "Date") {
        creaDateTime(id);
    }
    if (forms[fAct].ctls[id].type == "Checkbox") {
        $("#validation, #defVal > label").hide();
        $('<p id="pdefval"><label><input id="defaultValue" type="checkbox" /><span>Default Value</span></label></p>').appendTo("#defVal");
        $("#defaultValue").prop("checked", forms[fAct].ctls[id].defaultValue);
        $("#placeholder + label, #placeholder, #Mask, #Mask + label").hide();
        $("#defaultValue").on("change", function() {
            forms[fAct].ctls[wAct].defaultValue = $("#defaultValue").is(":checked");
            $("#wg" + wAct + " input").prop("checked", forms[fAct].ctls[wAct].defaultValue);
            M.updateTextFields();
        });
    } else {
        $("#defVal > label").show();
    }
    if (forms[fAct].ctls[id].type == "Combo") {
        $("#placeholder").val(forms[fAct].ctls[id].placeholder);
        $("#Mask, #Mask + label, #validation").hide();
        $("#listValues + label, #listValues, #placeholder + label, #placeholder").show();
        $("#placeholder").trigger("keyup");
        $("#listValues").val(forms[fAct].ctls[id].listValues);
        M.textareaAutoResize($("#listValues"));
        if (forms[fAct].ctls[id].sType == "Combo") {
            creaCombo(id);
        } else {
            creaOptions(id);
        }
    } else {
        $("#listValues + label, #listValues").hide();
    }
    if (forms[fAct].ctls[id].type == "Lookup") {
        $("#listValues").off();
        $("#placeholder").val(forms[fAct].ctls[id].placeholder);
        $("#Mask, #Mask + label, #validation").hide();
        $("#placeholder + label, #placeholder").show();
        creaLookup(id);
    }
    if (forms[fAct].ctls[id].type == "Grid") {
        $("#placeholder, #placeholder + label, #defVal label, #Mask, #Mask + label, #validation, #field, #field + label").hide();
        $("#listValues + label, #listValues").show();
        $("#listValues").val(forms[fAct].ctls[id].listValues);
        M.textareaAutoResize($("#listValues"));
        $("#defVal").prepend('<div class="input-field"><input id="gridT" type="text" class="validate" value="' + forms[fAct].ctls[id].defaultValue + '"/><label for="gridT">Grid Table</label></div>');
        $("#gridT").on("keyup", function() {
            forms[fAct].ctls[wAct].defaultValue = $("#gridT").val();
        });
        creaGrid(id);
    } else {
        $("#field, #field + label").show();
    }
    if (forms[fAct].ctls[id].type == "Image") {
        $("#placeholder, #placeholder + label, #Mask, #Mask + label").hide();
        $("<br/><br/><input type='file' id='loadFile' accept='image/*' style='display:none'/><img id='defaultValue' src='img/image.png' class='validate' style='width:100%;cursor:pointer' onclick='javascript:$(\"#loadFile\").trigger(\"click\");'></div>").appendTo("#defVal");
        if (forms[fAct].ctls[wAct].defaultValue) $("#defaultValue").attr("src", forms[fAct].ctls[wAct].defaultValue);
        $("#loadFile").on("change", function(e) {
            var file = document.querySelector("#loadFile").files[0];
            var reader = new FileReader(); //https://www.javascripture.com/FileReader
            reader.onload = function(e) {
                $("#image" + wAct + ", #defaultValue").attr("src", reader.result);
                forms[fAct].ctls[wAct].defaultValue = reader.result;
                //            frm.updateData("Foto", reader.result);
            };
            reader.onerror = function(e) {
                alert(e)
                console.log(e)
                // toastr.error(e.type, "Error");
            };
            reader.readAsDataURL(file);
        });
    }
    (forms[fAct].ctls[wAct].Duplicated) ? $("#btnDup").html('<i class="fa fa-bars"></i> Duplicated Values'): $("#btnDup").html('<i class="fa fa-minus"></i> Unique Values');
    $("#Mask").val(forms[fAct].ctls[id].Mask);
    $("#fldNotes").val(forms[fAct].ctls[id].fldNotes);
    $("#fldonFocus").val(forms[fAct].ctls[id].fldonFocus);
    $("#fldonBlur").val(forms[fAct].ctls[id].fldonBlur);
    $("#fldonChange").val(forms[fAct].ctls[id].fldonChange);
    minMaxKey();
    showType();
    M.updateTextFields();
}

function minMaxKey() {
    $("#minValue").val(forms[fAct].ctls[wAct].minValue);
    $("#minMsg").val(forms[fAct].ctls[wAct].minMsg);
    $("#maxValue").val(forms[fAct].ctls[wAct].maxValue);
    $("#maxMsg").val(forms[fAct].ctls[wAct].maxMsg);
    $("#minValue, #minMsg, #maxValue, #maxMsg").off("keyup");
    $("#minValue").on("keyup change", function() {
        forms[fAct].ctls[wAct].minValue = $("#minValue").val();
    });
    $("#minMsg").on("keyup", function() {
        forms[fAct].ctls[wAct].minMsg = $("#minMsg").val();
    });
    $("#maxValue").on("keyup change", function() {
        forms[fAct].ctls[wAct].maxValue = $("#maxValue").val();
    });
    $("#maxMsg").on("keyup", function() {
        forms[fAct].ctls[wAct].maxMsg = $("#maxMsg").val();
    });
}

function showVisible() {
    if (forms[fAct].ctls[wAct].Visible) {
        $("#wg" + wAct + " .input-field").show();
        $("#btnVisible").html('<i class="fa fa-eye"></i> Visible');
    } else {
        $("#wg" + wAct + " .input-field").hide();
        $("#btnVisible").html('<i class="fa fa-eye-slash"></i> Hidden');
    }
}

function showEnabled() {
    if (forms[fAct].ctls[wAct].Enabled) {
        $("#wg" + wAct + " *").prop("disabled", false);
        $("#btnEnabled").html('<i class="fa fa-check-circle-o"></i> Enabled');
    } else {
        $("#wg" + wAct + " *").prop("disabled", true);
        $("#btnEnabled").html('<i class="fa fa-ban"></i> Disabled');
    }
}

function showHideOptional() {
    if (forms[fAct].ctls[wAct].Required) {
        $("#btnOptional").html('<i class="fa fa-check-square-o"></i> Required');
        $("#reqMsg, #reqMsg + label").show();
        var h = $("#wg" + wAct + " div" + ((forms[fAct].ctls[wAct].sType == "Options") ? " >" : "") + " label");
        if (h.html().indexOf('>*</span>') == -1) h.append("<span class='req'>*</span>");
    } else {
        $("#btnOptional").html('<i class="fa fa-square-o"></i> Optional');
        $("#wg" + wAct + " label .req").remove();
        $("#reqMsg, #reqMsg + label").hide();
    }
}

function setType(m) {

    function setsubType(c, m, w) {
        $('#btnwidType').html("<i class='fa fa-" + c + "'></i> " + m).show();
        if (w != "check") {
            if (w != "wg") {
                $("#" + w + wAct + " + label > i").removeClass().addClass("fa fa-" + c);
            } else {
                $("#wg" + wAct + " label i").removeClass().addClass("fa fa-" + c);
            }
        }
    }

    forms[fAct].ctls[wAct].sType = m;
    switch (m) {
        case "Text":
            $("#validation").children().remove();
            $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="text" value="' + forms[fAct].ctls[wAct].minValue + '"><label for="minValue">Min value</label></div>' +
                '<div class="input-field"><input id="minMsg" type="text" value="' + forms[fAct].ctls[wAct].minMsg + '"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="text" value="' + forms[fAct].ctls[wAct].maxValue + '">' +
                '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text" value="' + forms[fAct].ctls[wAct].maxMsg + '"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
            $("#text" + wAct + ", #defaultValue").prop("type", "text");
            setsubType("i-cursor", "Text", "text");
            minMaxKey();
            break;
        case "Phone":
            $("#validation").children().remove();
            setsubType("phone", "Phone", "text");
            $("#text" + wAct + ", #defaultValue").prop("type", "tel");
            break;
        case "Email":
            $("#validation").children().remove();
            setsubType("envelope", "Email", "text");
            $("#text" + wAct + ", #defaultValue").prop("type", "email");
            break;
        case "Password":
            $("#validation").children().remove();
            $('<div class="section"><div><b>Validation</b></div></div><div class="input-field"><input id="minValue" type="password" value="' + forms[fAct].ctls[wAct].minValue + '"><label for="minValue">Min value</label></div>' +
                '<div class="input-field"><input id="minMsg" type="text" value="' + forms[fAct].ctls[wAct].minMsg + '"><label for="minMsg">Min message</label></div><div class="input-field"><input id="maxValue" type="password" value="' + forms[fAct].ctls[wAct].maxValue + '">' +
                '<label for="maxValue">Max value</label></div><div class="input-field"><input id="maxMsg" type="text" value="' + forms[fAct].ctls[wAct].maxMsg + '"><label for="maxMsg">Max message</label></div>').appendTo("#validation");
            $("#text" + wAct + ", #defaultValue").prop("type", "password");
            setsubType("key", "Password", "text");
            minMaxKey();
            break;
        case "URL":
            $("#validation").children().remove();
            setsubType("link", "URL", "text");
            $("#text" + wAct + ", #defaultValue").prop("type", "url");
            break;
        case "Number":
            setsubType("calculator", "Number", "number");
            creaNumber(wAct);
            break;
        case "Money":
            setsubType("money", "Money", "number");
            creaNumber(wAct);
            break;
        case "Date":
            if (forms[fAct].ctls[wAct].defaultValue.indexOf(":") != -1) forms[fAct].ctls[wAct].defaultValue = "";
            if (forms[fAct].ctls[wAct].minValue.indexOf(":") != -1) forms[fAct].ctls[wAct].minValue = "";
            if (forms[fAct].ctls[wAct].maxValue.indexOf(":") != -1) forms[fAct].ctls[wAct].maxValue = "";
            setsubType("calendar-o", "Date", "dateTime");
            creaDateTime(wAct);
            break;
        case "Time":
            if (forms[fAct].ctls[wAct].defaultValue.indexOf(",") != -1) forms[fAct].ctls[wAct].defaultValue = "";
            if (forms[fAct].ctls[wAct].minValue.indexOf(",") != -1) forms[fAct].ctls[wAct].minValue = "";
            if (forms[fAct].ctls[wAct].maxValue.indexOf(",") != -1) forms[fAct].ctls[wAct].maxValue = "";
            setsubType("clock-o", "Time", "dateTime");
            creaDateTime(wAct);
            break;
            // case "Date Time":
            //     setsubType("calendar", "Date Time", "dateTime");
            //     break;
        case "Check":
            setsubType("check-square-o", "Check", "check");
            break;
        case "Switch":
            setsubType("toggle-on", "Switch", "check");
            break;
        case "Button":
            setsubType("square", "Button", "check");
            break;
        case "Combo":
            creaCombo(wAct);
            setsubType("caret-square-o-down", "Combo", "wg");
            break;
        case "Options":
            creaOptions(wAct);
            setsubType("dot-circle-o", "Options", "wg");
            break;
        case "Buttons":
            setsubType("square", "Buttons", "wg");
            break;
        default:
            alert("Unknown subtype " + forms[fAct].ctls[wAct].sType);
    }
}

function showType() {
    $("#widType").empty();
    switch (forms[fAct].ctls[wAct].type) {
        case "Text":
            $("#widType").append($(
                '<li onclick="setType(\'Text\')"><a><i class="fa fa-i-cursor"></i>Text</a></li>' +
                '<li onclick="setType(\'Phone\')"><a><i class="fa fa-phone"></i>Phone</a></li>' +
                '<li onclick="setType(\'Email\')"><a><i class="fa fa-envelope"></i>Email</a></li>' +
                '<li onclick="setType(\'Password\')"><a><i class="fa fa-key"></i>Password</a></li>' +
                '<li onclick="setType(\'URL\')"><a><i class="fa fa-link"></i>URL</a></li>'));
            setType(forms[fAct].ctls[wAct].sType);
            break;
        case "Combo":
            $("#widType").append($(
                '<li onclick="setType(\'Combo\')"><a><i class="fa fa-caret-square-o-down"></i>Combo</a></li>' +
                '<li onclick="setType(\'Options\')"><a><i class="fa fa-dot-circle-o"></i>Options</a></li>'));
            //  '<li onclick="setType(\'Buttons\')"><a><i class="fa fa-square"></i>Buttons</a></li>'));
            setType(forms[fAct].ctls[wAct].sType);
            break;
        case "Number":
            $("#widType").append($(
                '<li onclick="setType(\'Number\')"><a><i class="fa fa-calculator"></i>Number</a></li>' +
                '<li onclick="setType(\'Money\')"><a><i class="fa fa-money"></i>Money</a></li>'));
            setType(forms[fAct].ctls[wAct].sType);
            break;
        case "Date":
            $("#widType").append($(
                '<li onclick="setType(\'Date\')"><a><i class="fa fa-calendar-o"></i>Date</a></li>' +
                '<li onclick="setType(\'Time\')"><a><i class="fa fa-clock-o"></i>Time</a></li>'));
            // '<li onclick="setType(\'Date Time\')"><a><i class="fa fa-calendar"></i>DateTime</a></li>'));
            setType(forms[fAct].ctls[wAct].sType);
            break;
        case "Checkbox":
            $("#widType").append($(
                '<li onclick="setType(\'Check\')"><a><i class="fa fa-check-square-o"></i>Check</a></li>' +
                '<li onclick="setType(\'Switch\')"><a><i class="fa fa-toggle-on"></i>Switch</a></li>' +
                '<li onclick="setType(\'Button\')"><a><i class="fa fa-square"></i>Button</a></li>'));
            setType(forms[fAct].ctls[wAct].sType);
            break;
        case "Lookup":
        case "Memo":
            $('#btnwidType').hide();
            break;
        case "Grid":
            $('#btnwidType').hide();
            break;
        case "Image":
            $('#btnwidType').hide();
            break;
        default:
            alert("Unknow type " + forms[fAct].ctls[wAct].type);
    }
}

function alt() {
    return $("#form").height() / (grid.cellHeight() + grid.verticalMargin());
}

function creaWidget(wg, nArr = true, wid) {

    function stW(st, wt) {
        st = '<div id="wg' + wID + '" class="fldActive" onclick="edit(' + wID +
            ');" onmouseleave="$(\'#copy, #trash\').remove();" onmouseover="ShowButtons(' + wID +
            ');"><div class="grid-stack-item-content">' + st +
            '</div></div>';
        return $(st);
    }

    function saveCtrl(wt) {
        if (typeof forms[fAct].ctls === 'undefined') {
            forms[fAct].ctls = [];
            forms[fAct].ctls.push({});
        }
        let node = $("#wg" + wAct);
        forms[fAct].ctls[wAct] = {
            type: wt,
            field: (wid) ? wid.field : "field" + wAct,
            caption: (wid) ? wid.caption : wt,
            Required: (wid) ? wid.Required : false,
            reqMsg: (wid) ? wid.reqMsg : "",
            Enabled: (wid) ? wid.Enabled : true,
            Visible: (wid) ? wid.Visible : true,
            sType: (wid) ? wid.sType : (wt == "Checkbox") ? "Check" : wt,
            tooltip: (wid) ? wid.tooltip : "",
            placeholder: (wid) ? wid.placeholder : "", //(wt == "Combo") ? "Choose your option" : ((wt == "Lookup") ? "Choose your data" : ""),
            help: (wid) ? wid.help : "",
            decimal: (wid) ? wid.decimal : 0,
            listValues: (wid) ? wid.listValues : (wt == "Combo") ? "Option 1\nOption 2\nOption 3" : ((wt == "Grid") ? "Columna 1^Field 1\nColumn 2^Field 2\nColumn 3^Field 3" : ""),
            defaultValue: (wid) ? wid.defaultValue : (wt == "Image") ? "img/image.png" : "",
            minValue: (wid) ? wid.minValue : "",
            minMsg: (wid) ? wid.minMsg : "",
            maxValue: (wid) ? wid.maxValue : "",
            maxMsg: (wid) ? wid.maxMsg : "",
            Duplicated: (wid) ? wid.Duplicated : true,
            parentTable: (wid) ? wid.parentTable : "",
            parentField: (wid) ? wid.parentField : "",
            displayField: (wid) ? wid.displayField : "",
            Mask: (wid) ? wid.Mask : "",
            fldNotes: (wid) ? wid.fldNotes : "",
            fldonFocus: (wid) ? wid.fldonFocus : "",
            fldonBlur: (wid) ? wid.fldonBlur : "",
            fldonChange: (wid) ? wid.fldonChange : "",
            deleted: false,
            x: node.attr("data-gs-x"),
            y: node.attr("data-gs-y"),
            width: node.attr("data-gs-width"),
            height: node.attr("data-gs-height")
        };
    }

    wAct = wID;
    $("#tabs > li").removeClass("disabled");
    M.Tabs.getInstance($("#tabs")).select("fieldTab");
    switch (wg) {
        case "Text":
            grid.addWidget(stW('<div class="input-field"><input id="text' + wID +
                '" type="text" class="validate" value="' + ((wid) ? wid.defaultValue : "") + '"><label for="text' + wID +
                '"><i class="fa fa-i-cursor"></i> ' + ((wid) ? wid.caption : "Text") + '</label></div>', "Text"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 2, wAct);
            break;
        case "Memo":
            grid.addWidget(stW('<div class="input-field">' +
                '<textarea id="textarea' + wID + '" class="materialize-textarea"></textarea>' +
                '<label for="textarea' + wID + '"><i class="fa fa-paragraph"></i> ' + ((wid) ? wid.caption : "Memo") + '</label></div>', "Memo"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 20, wAct);
            if (wid) $("#textarea" + wID).html(wid.defaultValue);
            break;
        case "Number":
            grid.addWidget(stW('<div class="input-field"><input id="number' + wID +
                '" type="number" class="validate" value="' + ((wid) ? wid.defaultValue : "") + '"><label for="number' + wID +
                '"><i class="fa fa-calculator"></i> ' + ((wid) ? wid.caption : "Number") + '</label></div>', "Number"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 2, wAct);
            break;
        case "Date":
            grid.addWidget(stW('<div class="input-field"><input id="dateTime' + wID +
                '" type="text" class="datepicker validate" value="' + ((wid) ? wid.defaultValue : "") + '"><label for="dateTime' + wID +
                '"><i class="fa fa-calendar-o"></i> Date</label></div>', "Date"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 2, wAct);
            M.AutoInit();
            break;
        case "Checkbox":
            grid.addWidget(stW('<div class="input-field"><p><label><input id="check' + wID +
                '" type="checkbox" /><span>' + ((wid) ? wid.caption : "Checkbox") + '</span></label></p></div>', "Checkbox"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 2, wAct);
            if (wid) $("#check" + wID).prop("checked", wid.defaultValue);
            break;
        case "Combo":
            grid.addWidget(stW('<div class="input-field"><select id="combo' +
                // wID + '"><option value="" disabled selected>Choose your option</option>' +
                wID + '">' +
                '<option value="0">Option 1</option>' +
                '<option value="1">Option 2</option>' +
                '<option value="2">Option 3</option>' +
                '</select><label><i class="fa fa-caret-square-o-down"></i> Combo</label></div>', "Combo"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 20, wAct);
            M.FormSelect.init($('#combo' + wAct));
            break;
        case "Image":
            grid.addWidget(stW('<div><label for="image' + wID +
                '"><i class="fa fa-image"></i> ' + ((wid) ? wid.caption : "Image") + '</label><br/><img id="image' + wID +
                '" src="' + ((wid) ? wid.defaultValue : "img/image.png") + '" class="validate" style="width:100%"></div>', "Image"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 20, wAct);
            break;
        case "Lookup":
            grid.addWidget(stW('<div class="input-field"><select id="lookup' +
                wID + '">' +
                // '<option value="0">Data 1</option>' +
                // '<option value="1">Data 2</option>' +
                '</select><label><i class="fa fa-database"></i> Lookup</label></div>', "Lookup"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 2, false, 4, 12, 2, 20, wAct);
            M.FormSelect.init($('#lookup' + wAct));
            break;
        case "Grid":
            grid.addWidget(stW('<div class="input-field"><label for="table' + wID + '"><i class="fa fa-table"></i> ' + ((wid) ? wid.caption : "Grid") + '</label><br /><table id="table' + wID +
                '" class="responsive-table"></table></div>', "Grid"), (wid) ? wid.x : 0, (wid) ? wid.y : alt(), (wid) ? wid.width : 4, (wid) ? wid.height : 7, false, 4, 12, 2, 20, wAct);
            saveCtrl(wg);
            nArr = false;
            creaGrid(wAct);
            break;
    }
    if (nArr) saveCtrl(wg);
    edit(wAct);
    wID++;
}

function loadFrm(frmID) {
    if (forms[frmID].deleted) {
        alert("La forma " + frmID + " está borrada!");
        return;
    }
    if (fAct == frmID) return;
    fAct = frmID;
    $("#frmName").val(forms[fAct].name);
    $("#frmCaption").val(forms[fAct].caption);
    $("#frmTitle").html(forms[fAct].caption);
    $("#frmDesc").val(forms[fAct].description);
    $("#frmDescription").html(forms[fAct].description);
    $("#frmTooltip").val(forms[fAct].tooltip);
    $("#frmLocal").val(forms[fAct].localVars);
    $("#frmNotes").val(forms[fAct].notes);
    $("#frmCreateStart").val(forms[fAct].createStart);
    $("#frmCreateEnd").val(forms[fAct].createEnd);
    $("#frmValidateStart").val(forms[fAct].validateStart);
    $("#frmValidateEnd").val(forms[fAct].validateEnd);
    $("#frmSaveStart").val(forms[fAct].saveStart);
    $("#frmSaveEnd").val(forms[fAct].saveEnd);
    $("#frmCancelStart").val(forms[fAct].cancelStart);
    $("#frmCancelEnd").val(forms[fAct].cancelEnd);
    $("#frmCloseStart").val(forms[fAct].closeStart);
    $("#frmCloseEnd").val(forms[fAct].closeEnd);
    wID = 0;
    wAct = 0;
    lastEdit = -1;
    grid.removeAll();
    arr = [];
    if (forms[fAct].ctls) {
        // grid.batchUpdate();
        forms[fAct].ctls.forEach(function(ctl) {
            if (!ctl.deleted) creaWidget(ctl.type, true, ctl);
        });
        //   grid.commit();
    } else {
        M.Tabs.getInstance($("#tabs")).select("formTab");
        $("#tabs > li:first-child").addClass("disabled");
    }
    M.updateTextFields();
}

function newForm() {
    if (wID != 0) M.Tabs.getInstance($("#tabs")).select("formTab");
    $('#fieldTab :input, #formTab :input').val('');
    grid.removeAll();
    wID = 0;
    wAct = 0;
    arr = [];
    forms.push({
        deleted: false,
        caption: "New form",
        description: "Form description"
    });
    fAct = fID;
    lastEdit = -1;
    $("#frmTitle, #frmDescription").html("");
    $("#tabs > li:first-child").addClass("disabled");
    $("#frmCaption").val("New form").trigger("keyup");
    $("#frmDesc").val("Form description").trigger("keyup");
    $('<li id="frm' + fID + '" class="collection-item" onclick="loadFrm(' + fID + ')"><div>New form</div><span>Form description</span><i onclick="javascript:delFrm(' + fID + ')" class="secondary-content"><i class="fa fa-trash" title="Delete this form"></i></i></li>').appendTo("#forms");
    fID++;
    M.updateTextFields();
}

function delFrm(frmID) {
    event.stopPropagation();
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        confirmButtonColor: "red",
        cancelButtonText: 'No, cancel!',
        cancelButtonColor: "green",
        focusCancel: true,
        reverseButtons: false
    }).then((result) => {
        if (result.value) {
            forms[frmID] = {
                deleted: true
            };
            $("#frm" + frmID).remove();
            var und = forms.findIndex(function(item) {
                return item.deleted == false;
            });
            if (und != -1) {
                loadFrm(und);
            } else {
                newForm();
            }
        }
    });
}

function copyClip(obj) {
    const el = document.getElementById(obj);
    el.select();
    document.execCommand('copy');
    el.selectionEnd = 0;
    Swal.fire({
        text: "Code copied to clipboard",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        background: "#fff59d",
        timerProgressBar: true
    });
}

/* Menu buttons */
{
    $("#btnSave").on("click", function() {
        let prj = {};
        prj.Version = "0.2";
        prj.forms = forms;
        prj.name = $("#projName").val();
        prj.description = $("#projDesc").val();
        prj.globalVars = $("#projGlobal").val();
        prj.notes = $("#projNotes").val();
        prj.initStart = $("#projInitStart").val();
        prj.initEnd = $("#projInitEnd").val();
        prj.finishStart = $("#projFinishStart").val();
        prj.finishEnd = $("#projFinishEnd").val();
        var a = document.createElement("a");
        var file = new Blob([JSON.stringify(prj, null, '  ')], {
            type: 'text/plain'
        });
        a.href = URL.createObjectURL(file);
        a.download = (prj.name) ? prj.name + ".json" : "555.json";
        a.click();
    });

    $("#btnLoad").on("click", function() {
        function loadProject() {
            $("#File").val("");
            $("#File").off().on("change", function(e) {
                let file = document.querySelector("#File").files[0];
                let reader = new FileReader();
                reader.onload = function(e) {
                    let prj = JSON.parse(reader.result);
                    console.log(prj);
                    $("#projName").val(prj.name);
                    $("#projectTitle").html(prj.name);
                    $("#projDesc").val(prj.description);
                    $("#projectTitle").prop("title", prj.description);
                    $("#projGlobal").val(prj.globalVars);
                    $("#projNotes").val(prj.notes);
                    $("#projInitStart").val(prj.initStart);
                    $("#projInitEnd").val(prj.initEnd);
                    $("#projFinishStart").val(prj.finishStart);
                    $("#projFinishEnd").val(prj.finishEnd);
                    forms = prj.forms;
                    $("#forms li").remove();
                    forms = forms.filter(function(item) {
                        return item.deleted == false;
                    });
                    fID = forms.length;
                    forms.forEach(function(f, i) {
                        if (!f.deleted) {
                            if (f.ctls)(f.ctls.forEach(function(c, j) {
                                if (c.deleted) forms[i].ctls.splice(j, 1);
                            }));
                        } else {
                            fID--;
                        }
                        $('<li id="frm' + i + '" class="collection-item" onclick="loadFrm(' + i + ')"><div>' + forms[i].caption + '</div><span>' + forms[i].description + '</span><i onclick="javascript:delFrm(' + i + ')" class="secondary-content"><i class="fa fa-trash"></i></i></li>').appendTo("#forms");
                    });
                    if (forms.length) {
                        fAct = -1;
                        loadFrm(0);
                    } else {
                        fID = 0;
                        newForm();
                    }
                };
                reader.onerror = function(e) {
                    toastr.error(e.type, "Error");
                };
                reader.readAsText(file);
            });
            $("#File").trigger("click");
        }

        if (grid.engine.nodes.length) {
            Swal.fire({
                title: 'Are you sure?',
                html: "<b>All the widgets will be lost</b><div>Proceed with load?</div>You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, proceed with load',
                confirmButtonColor: "red",
                cancelButtonText: 'No, cancel!',
                cancelButtonColor: "green",
                focusCancel: true,
                reverseButtons: false
            }).then((result) => {
                if (result.value) {
                    loadProject();
                }
            });
        } else {
            loadProject();
        }
    });

    $("#btnNewForm").on("click", function() {
        newForm();
    });

    $("#btnGen").on("click", function() {

        function loadCode(fileName, dest) {
            var client = new XMLHttpRequest();
            client.open('GET', fileName);
            client.onreadystatechange = function() {
                $(dest).val(client.responseText);
            }
            client.send();
        }

        loadCode('code/cd555index.html', "#codHTML5");
        loadCode('code/cd555.css', "#codCSS3");
        loadCode('code/cd555.js', "#codjs");
        loadCode('code/cd555node.js', "#codNode");
        M.Tabs.getInstance($("#codeTabs")).select("HTML5");
    });

    $("#btnFrm").on("click", function() {
        document.getElementById("forms").style.display = "block";
    });
}

/* Widget creation buttons */
{
    $("#btnText").on("click", function() {
        creaWidget("Text");
    });

    $("#btnMemo").on("click", function() {
        creaWidget("Memo");
    });

    $("#btnNumber").on("click", function() {
        creaWidget("Number");
    });

    $("#btnDate").on("click", function() {
        creaWidget("Date");
    });

    $("#btnCheck").on("click", function() {
        creaWidget("Checkbox");
    });

    $("#btnCombo").on("click", function() {
        creaWidget("Combo");
    });

    $("#btnImage").on("click", function() {
        creaWidget("Image");
    });

    $("#btnLookup").on("click", function() {
        creaWidget("Lookup");
    });

    $("#btnGrid").on("click", function() {
        creaWidget("Grid");
    });
}

/* Keyups & Clicks for fields */
{
    $("#field").on("keyup", function() {
        forms[fAct].ctls[wAct].field = $("#field").val();
    });

    $("#caption").on("keyup", function() {
        forms[fAct].ctls[wAct].caption = $("#caption").val();
        if (forms[fAct].ctls[wAct].type == "Checkbox") {
            $("#check" + wAct + " + span").html(forms[fAct].ctls[wAct].caption);
        } else {
            var l = $("#wg" + wAct + " div > label");
            l.html(l.html().substr(0, l.html().indexOf("> ") + 2) + forms[fAct].ctls[wAct].caption);
        }
        showHideOptional();
    });

    $("#reqMsg").on("keyup", function() {
        forms[fAct].ctls[wAct].reqMsg = $("#reqMsg").val();
    });

    $("#tooltip").on("keyup", function() {
        forms[fAct].ctls[wAct].tooltip = $("#tooltip").val();
        $("#wg" + wAct).prop("title", forms[fAct].ctls[wAct].tooltip);
    });

    $("#placeholder").on("keyup", function() {
        var ph = $("#placeholder").val()
        forms[fAct].ctls[wAct].placeholder = ph;
        switch (forms[fAct].ctls[wAct].type) {
            case "Memo":
                $("#textarea" + wAct).attr("placeholder", ph);
                M.updateTextFields();
                break;
            case "Text":
            case "Number":
            case "Date":
                $("#wg" + wAct + " input").attr("placeholder", ph);
                M.updateTextFields();
                break;
            case "Lookup":
                M.FormSelect.getInstance($("#lookup" + wAct)).input.value = ph;
                $("#wg" + wAct + " li:first-child span").html(ph);
                $("#lookup" + wAct + " option:first-child").html(ph);
                break;
            case "Combo":
                if (forms[fAct].ctls[wAct].sType != "Options") {
                    M.FormSelect.getInstance($("#combo" + wAct)).input.value = ph;
                    $("#wg" + wAct + " li:first-child span").html(ph);
                    $("#combo" + wAct + " option:first-child").html(ph);
                }
                break;
        }
    });

    $("#help").on("keyup", function() {
        forms[fAct].ctls[wAct].help = $("#help").val();
    });

    $("#Mask").on("keyup", function() {
        forms[fAct].ctls[wAct].Mask = $("#Mask").val();
    });

    $("#fldNotes").on("keyup", function() {
        forms[fAct].ctls[wAct].fldNotes = $("#fldNotes").val();
    });

    $("#fldonFocus").on("keyup", function() {
        forms[fAct].ctls[wAct].fldonFocus = $("#fldonFocus").val();
    });

    $("#fldonBlur").on("keyup", function() {
        forms[fAct].ctls[wAct].fldonBlur = $("#fldonBlur").val();
    });

    $("#fldonChange").on("keyup", function() {
        forms[fAct].ctls[wAct].fldonChange = $("#fldonChange").val();
    });

    $("#btnOptional").on("click", function() {
        forms[fAct].ctls[wAct].Required = !forms[fAct].ctls[wAct].Required;
        showHideOptional();
    });

    $("#btnEnabled").on("click", function() {
        forms[fAct].ctls[wAct].Enabled = !forms[fAct].ctls[wAct].Enabled;
        showEnabled();
    });

    $("#btnVisible").on("click", function() {
        forms[fAct].ctls[wAct].Visible = !forms[fAct].ctls[wAct].Visible;
        showVisible();
    });

    $("#btnDup").on("click", function() {
        forms[fAct].ctls[wAct].Duplicated = !forms[fAct].ctls[wAct].Duplicated;
        if (forms[fAct].ctls[wAct].Duplicated) {
            $("#btnDup").html('<i class="fa fa-bars"></i> Duplicated Values');
        } else {
            $("#btnDup").html('<i class="fa fa-minus"></i> Unique Values');
        }
    });

    $("#frmName").on("keyup", function() {
        forms[fAct].name = $("#frmName").val();
    });

    $("#frmCaption").on("keyup", function() {
        forms[fAct].caption = $("#frmCaption").val();
        $("#frmTitle, #frm" + fAct + " div").html(forms[fAct].caption);
    });

    $("#frmDesc").on("keyup", function() {
        forms[fAct].description = $("#frmDesc").val();
        $("#frmDescription, #frm" + fAct + " span").html(forms[fAct].description);
    });

    $("#frmTooltip").on("keyup", function() {
        forms[fAct].tooltip = $("#frmTooltip").val();
    });

    $("#frmLocal").on("keyup", function() {
        forms[fAct].localVars = $("#frmLocal").val();
    });

    $("#frmNotes").on("keyup", function() {
        forms[fAct].notes = $("#frmNotes").val();
    });

    $("#frmCreateStart").on("keyup", function() {
        forms[fAct].createStart = $("#frmCreateStart").val();
    });

    $("#frmCreateEnd").on("keyup", function() {
        forms[fAct].createEnd = $("#frmCreateEnd").val();
    });

    $("#frmValidateStart").on("keyup", function() {
        forms[fAct].validateStart = $("#frmValidateStart").val();
    });

    $("#frmValidateEnd").on("keyup", function() {
        forms[fAct].validateEnd = $("#frmValidateEnd").val();
    });

    $("#frmSaveStart").on("keyup", function() {
        forms[fAct].saveStart = $("#frmSaveStart").val();
    });

    $("#frmSaveEnd").on("keyup", function() {
        forms[fAct].saveEnd = $("#frmSaveEnd").val();
    });

    $("#frmCancelStart").on("keyup", function() {
        forms[fAct].cancelStart = $("#frmCancelStart").val();
    });

    $("#frmCancelEnd").on("keyup", function() {
        forms[fAct].cancelEnd = $("#frmCancelEnd").val();
    });

    $("#frmCloseStart").on("keyup", function() {
        forms[fAct].closeStart = $("#frmCloseStart").val();
    });

    $("#frmCloseEnd").on("keyup", function() {
        forms[fAct].closeEnd = $("#frmCloseEnd").val();
    });

    $("#projName").on("keyup", function() {
        $("#projectTitle").html($("#projName").val());
    });

    $("#projDesc").on("keyup", function() {
        $("#projectTitle").prop("title", $("#projDesc").val());
    });
}

grid.on('change', function(event, items) {
    items.forEach(function(i0) {
        c = i0.id;
        forms[fAct].ctls[c].x = i0.x;
        forms[fAct].ctls[c].y = i0.y;
        forms[fAct].ctls[c].width = i0.width;
        forms[fAct].ctls[c].height = i0.height;
    })
});

newForm();
$("#projName").val("Project name");
$("#projDesc").val("Project description");
$("#projName, #projDesc").trigger("keyup");
M.AutoInit();
window.onclick = function(event) {
    if (event.target != document.getElementById("forms") && event.target != document.getElementById("btnFrm")) {
        document.getElementById("forms").style.display = "none";
    }
}