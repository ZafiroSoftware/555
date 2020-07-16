var genApp = true,
    inicio = true,
    searched = false,
    cteAct = localStorage.getItem("cliente"),
    dataGrid,
    borra,
    loadPanel;

$(function() {
    resizeWindow();

    loadPanel = $("#loadMenu").dxLoadPanel({
        message: "Cargando datos...",
        visible: true,
        showIndicator: true,
        showPane: true,
        closeOnOutsideClick: false,
    }).dxLoadPanel("instance");

    DevExpress.localization.locale("es");

    Waves.attach(".waveMenu", ["waves-block"]);
    Waves.attach(".flat-icon", ["waves-circle"]);
    Waves.attach(".waves", ["waves-float"]);
    Waves.init();

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "4000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    $("#usuarioID").dxTextBox({
        placeholder: "Usuario",
        stylingMode: "underlined",
        width: "240px",
        hint: "Clave de usuario para acceder a Zafirosoft ERP",
        onEnterKey: function(e) {
            $("#password").dxTextBox("instance").focus();
        },
        buttons: [{
            name: "btnUsrID",
            location: "after",
            options: {
                icon: "fa fa-user",
                type: "default",
                disabled: true,
            },
        }, ],
    });

    $("#password").dxTextBox({
        placeholder: "Contraseña",
        mode: "password",
        stylingMode: "underlined",
        width: "240px",
        hint: "Contraseña de usuario para acceder a Zafirosoft ERP",
        onEnterKey: function(e) {
            Inicia();
        },
        buttons: [{
            name: "btnPwd",
            location: "after",
            options: {
                icon: "fa fa-lock",
                type: "default",
                disabled: true,
            },
        }, ],
    });

    $("#usuarioID").dxTextBox("instance").focus();

    if (cteAct == null) {
        setCliente();
    } else {
        $("#selCliente").addClass("hide");
        $("#usuarioID").dxTextBox("instance").focus();
    }

    // Quitar estas 3 para pedir login 
    //  $("#sis, #pantallasExtras").removeClass("hide");
    //  $("#box").addClass("hide");
    //  startZERP();

});

var ZSmeses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
];

function formatDate(date) {
    var month = date.getMonth(),
        day = date.getDate(),
        year = date.getFullYear();
    return day + "/" + ZSmeses[month] + "/" + year;
}

function parseDate(e) {
    var parts = e.toLowerCase().split("/");
    if (parts.length != 3) return;
    var day = Number(parts[0]),
        month = Number(
            ZSmeses.indexOf(parts[1].charAt(0).toUpperCase() + parts[1].slice(1))
        ),
        year = Number(parts[2]);
    return new Date(year, month, day);
}

function generaApps() {
    $.ajax({
        url: "tableApps",
        data: {},
        type: "GET",
        dataType: "json", // this bit here
        success: function(response) {
            var st = "";
            for (i = 0; i < response.length; i++) {
                if (i % 3 == 0) {
                    if (i != 0) {
                        st += "</tr><tr>";
                    } else {
                        st += "<tr>";
                    }
                }
                st +=
                    "<td><a href=\"javascript:despMenu('" +
                    response[i].Modulo +
                    '\');" class="zapps waves-effect"><div class="center-align"><i class="fa fa-3x fa-' +
                    response[i].Icono +
                    '"></i></div><div class="center-align"><small>' +
                    response[i].Modulo +
                    "</small></div></a></td>";
            }
            st += "</tr>";
            $(st).appendTo(".appsTbl");
            loadPanel.hide();
            $("#CargaApps").hide();
        },
        error: function(error) {
            console.log(error);
        },
    });
}

function endSearch() {
    $(".subMenu, .opcion").removeClass("hide");
    $(".mainRowOption").addClass("selOp");
    $("#iconSearch").removeClass("fa-close").addClass("fa-search").prop("title", "");
    $("#search").val("");
}

function ellipsis(s, n) {
    return s.length > n ? s.substr(0, n) + "&hellip;" : s;
}

function generaMenu() {
    var antPadre = null,
        st = "",
        incID = "",
        eli = 0;
    antGrupo = "";
    $.ajax({
        url: "Menus",
        data: {},
        type: "GET",
        dataType: "json",
        success: function(response) {
            for (i = 0; i < response.length; i++) {
                //console.log(response[i].PadreId + " " + response[i].Opcion + " " + response[i].Texto + " " + response[i].Icono + ' ' + response[i].Ruta);   response.length
                st = "";
                var mnu = response[i];
                if (mnu.Texto == "---") {
                    //   st = '<li><div class="divider"></div></li>';
                    //   $(st).appendTo($("#" + incID));
                } else {
                    if (mnu.Ruta === null) {
                        //Si no tiene ruta, es grupo de menú
                        antPadre = mnu.MenuId;
                        if (mnu.PadreId == null) {
                            //Si el padre es null, grupo principal
                            if (i != 0) {
                                //  $("</div></div>").appendTo("#elMenu");
                            }
                            st =
                                '<div id="el' +
                                i +
                                '" class="grpOpcion"><div id="mel' +
                                i +
                                '" class="mainRowOption" title="' +
                                mnu.Texto +
                                '">' +
                                '<i class="Row elIcono fa fa-' +
                                mnu.MIcono +
                                '"></i><div class="Row elTexto">' +
                                ellipsis(mnu.Texto, 15) +
                                '</div><i class="Row elFlecha fa fa-sort-down"></i></div><div id="sel' +
                                i +
                                '" class="hide subMenu">';
                            $(st).appendTo("#elMenu");
                            incID = "#sel" + i;
                            eli = 16;
                        } else {
                            //Si la ruta es Null y hay un padre, entonces es subMenú
                            st =
                                '<div id="el' +
                                i +
                                '" class="grpOpcion"><div id="mel' +
                                i +
                                '" class="mainRowOption" title="' +
                                mnu.Texto +
                                '">' +
                                '<i class="Row elIcono fa fa-' +
                                mnu.MIcono +
                                '"></i><div class="Row elTexto">' +
                                ellipsis(mnu.Texto, 14) +
                                '</div><i class="Row elFlecha fa fa-sort-down"></i></div><div id="sel' +
                                i +
                                '" class="hide subMenu">';
                            $(st).appendTo(incID);
                            antGrupo = incID;
                            incID = "#sel" + i;
                            eli = 12;
                        }
                    } else {
                        if (mnu.PadreId != antPadre) {
                            //Si la ruta no es null y cambió de padre
                            incID = antGrupo;
                            antPadre = mnu.PadreId;
                            eli = 14;
                        }
                        st =
                            '<div id="op' +
                            i +
                            '" class="opcion" title="' +
                            mnu.Opcion +
                            '"><i class="Row elIcono fa fa-' +
                            mnu.Icono +
                            '"></i>' +
                            '<div class="Row elsubTexto">' +
                            ellipsis(mnu.Opcion, eli) +
                            "</div></div>";
                        $(st).appendTo(incID);
                    }
                }
            }
            // Waves.attach('.opcion');

            $(".grpOpcion").on("click", function(e) {
                if (searched) {
                    endSearch();
                    searched = false;
                } else {
                    var s = e.currentTarget.id;
                    $("#s" + s).toggleClass("hide");
                    s = "#m" + s;
                    $(s).toggleClass("selOp");
                }
                e.stopPropagation();
            });

            $(".opcion").click(function(e) {
                e.stopPropagation();
            });
            loadPanel.hide();
        },
        error: function(error) {
            console.log(error);
        },
    });
}

function searchMenu() {
    var st = $("#search").val().toUpperCase(),
        ar = $(".opcion");
    $(".subMenu").removeClass("hide");
    if (st != "") {
        $("#iconSearch").removeClass("fa-search").addClass("fa-close").prop("title", "Borrar búsqueda (ESC)");
    } else {
        $("#iconSearch").removeClass("fa-close").addClass("fa-search").prop("title", "");
    }
    for (var i = 0; i < ar.length; i++) {
        ar[i].title.toUpperCase().includes(st) ?
            $(ar[i]).removeClass("hide") :
            $(ar[i]).addClass("hide");
    }
    searched = true;
}

window.mobilecheck = function() {
    var check = false;
    (function(a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            ) ||
            navigator.userAgent.indexOf("iPad") > -1
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function resizeWindow() {
    $("#elMenu").css("height", (100 * (window.outerHeight - 64) / window.outerHeight).toString() + "%");
}

function Inicia() {

    function showLogin(focus) {
        $("#usuarioID").dxTextBox({
            disabled: false
        });
        $("#password").dxTextBox({
            disabled: false
        });
        $("#iniciar").prop("disabled", false);
        $(focus).dxTextBox("instance").focus();
    }

    $("#usuarioID").dxTextBox({
        disabled: true
    });
    $("#password").dxTextBox({
        disabled: true
    });
    $("#iniciar").prop("disabled", true);
    loginMsg("Validando. Espere por favor...", "");
    usuario = $("#usuarioID").dxTextBox("instance").option("value");
    $.ajax({
        url: 'ValidarUsuarioZERP',
        data: {
            Usuario: usuario,
            Password: $("#password").dxTextBox("instance").option("value"),
            cte: cteAct
        },
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            switch (res.Password) {
                case 0:
                    toastr.success('¡ Bienvenido ' + res.Nombre + ' !', "Zafirosoft ERP");
                    $("#sis, #pantallasExtras").removeClass("hide");
                    $("#box").addClass("hide");
                    $("#usrNameHead").html(res.Nombre);
                    $("#usrCorreoHead").html(res.Correo);
                    $("#avatar img").attr("src", res.Foto);
                    $(".imgUsr img").attr("src", res.Foto);
                    startZERP();
                    return;
                case 1:
                    loginMsg('El usuario no existe', "red");
                    showLogin("#usuarioID");
                    return;
                case 2:
                    loginMsg('La contraseña es incorrecta', "red");
                    showLogin("#password");
                    return;
            }
        },
        error: function(error) {
            console.log(error);
            loginMsg(error, "red");
            showLogin("#usuarioID");
        }
    });
}

function loginMsg(t, c) {
    $("#validando").removeClass("hide").html(t).css("color", c);
}

function logout() {
    if (!inicio) {
        toastr.info("¡ Hasta luego !", 'Salida');
    } else {
        inicio = true;
    }
    window.onbeforeunload = null;
    location.reload();
}

function setCliente() {
    $("#box").addClass("hide");
    $("#selCliente").dxPopup({
        width: 250,
        height: 190,
        contentTemplate: $("#boxEmp"),
        showTitle: true,
        title: "Nombre del Cliente Zafirosoft",
        visible: true,
        dragEnabled: false,
        showCloseButton: false,
        closeOnOutsideClick: false,
        onShown: function() {
            $("#empresa").keyup(function(event) {
                if (event.which == 13) {
                    grabaCliente();
                }
            }).focus();
        }
    });
}

function grabaCliente() {
    cteAct = $("#empresa").val();
    $.ajax({
        url: "ValidaCliente",
        data: {
            cliente: cteAct,
        },
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response) {
                localStorage.setItem("cliente", cteAct);
                logout();
            } else {
                setCliente();
                toastr.error('Por favor intente de nuevo.', 'El Cliente no existe');
            }
        },
        error: function(err) {
            toastr.error(err, 'Error de conexión');
            setCliente();
        },
    });
}

function startZERP() {
    var drawer = $("#sideMenu")
        .dxDrawer({
            opened: true,
            height: "100%",
            closeOnOutsideClick: true,
            template: function() {
                generaMenu();
                return $("#elMenu");
            },
        })
        .dxDrawer("instance");

    var popWin = $("#popWin")
        .dxPopup({
            visible: false,
            showTitle: false,
            dragEnabled: false,
            closeOnOutsideClick: true,
            shading: false,
            contentTemplate: $("#alertasPop"),
            position: {
                my: "top",
                at: "left bottom",
                of: $("#bellNotice"),
                collision: "fit"
            },
            width: "320px",
            height: "auto",
            onShowing: function() {
                $("#bellNotice").css("background-color", "#DEE0E1");
                $("#moreOptions").css("background-color", "#DEE0E1");
            },
            onHiding: function() {
                $("#bellNotice").css("background-color", "white");
                $("#moreOptions").css("background-color", "white");
            }
        })
        .dxPopup("instance");

    var popMod = $("#popMod")
        .dxPopup({
            visible: false,
            showTitle: false,
            dragEnabled: false,
            closeOnOutsideClick: true,
            shading: false,
            contentTemplate: $("#modulosPop"),
            position: {
                my: "top",
                at: "left bottom",
                of: $("#apps"),
                collision: "fit",
                offset: "-53 0",
            },
            width: "320px",
            height: "auto",
            onShowing: function() {
                $("#apps").css("background-color", "#DEE0E1");
                $("#moreOptions").css("background-color", "#DEE0E1");
            },
            onHiding: function() {
                $("#apps").css("background-color", "white");
                $("#moreOptions").css("background-color", "white");
            }
        })
        .dxPopup("instance");

    var popUsr = $("#popUsr")
        .dxPopup({
            visible: false,
            showTitle: false,
            dragEnabled: false,
            closeOnOutsideClick: true,
            shading: false,
            contentTemplate: $("#usuarioPop"),
            position: {
                my: "top",
                at: "left bottom",
                of: $("#avatar"),
                collision: "fit",
                offset: "-110 15"
            },
            width: "300px",
            height: "auto",
            onShowing: function() {
                $("#avatar").css("background-color", "#DEE0E1");
                $("#moreOptions").css("background-color", "#DEE0E1");
            },
            onHiding: function() {
                $("#avatar").css("background-color", "white");
                $("#moreOptions").css("background-color", "white");
            }
        })
        .dxPopup("instance");

    var popMore = $("#popMore").dxPopup({
            visible: false,
            showTitle: false,
            dragEnabled: false,
            closeOnOutsideClick: true,
            shading: false,
            contentTemplate: $("#mnuMore"),
            position: {
                my: "top",
                at: "left bottom",
                of: $("#moreOptions"),
                collision: "fit",
                offset: "400 8",
            },
            width: "300px",
            height: "auto",
            onShowing: function() {
                $("#moreOptions").css("background-color", "#DEE0E1");
            },
            onHiding: function() {
                $("#moreOptions").css("background-color", "white");
            }
        })
        .dxPopup("instance");

    $("#titulo").click(function(e) {
        drawer.toggle();
    }).css("cursor", "pointer");

    $("#iconSearch").click(function(e) {
        if ($("#iconSearch").hasClass("fa-close")) {
            endSearch();
            $("#search").focus();
        }
    });

    $("#search").keyup(function(e) {
        if (e.which == 27) {
            endSearch();
        }
    })

    $(document).on("click", "#bellNotice, #mnuAlertas", function(e) {
        popMore.hide();
        popWin.show();
        $("#alertasTab")
            .dxTabPanel({
                loop: true,
                swipeEnabled: true,
                items: [{
                        title: "Alertas",
                        icon: "fa fa-warning",
                        html: "<b>Alertas</b>",
                        badge: "5",
                    },
                    {
                        title: "Mensajes",
                        icon: "fa fa-envelope",
                        html: "<b>Mensajes</b>",
                        badge: "8",
                    },
                    {
                        title: "Tareas",
                        icon: "fa fa-tasks",
                        html: "<b>Tareas</b>",
                        badge: "2",
                    },
                ],
            })
            .dxTabPanel("instance");
    });

    $(document).on("click", "#apps, #mnuModulos", function(e) {
        popMore.hide();
        if (genApp) {
            loadPanel.show();
            generaApps();
            genApp = false;
        }
        popMod.show();
    });

    $(document).on("click", "#avatar, #mnuConfiguracion", function(e) {
        popMore.hide();
        popUsr.show();
    });

    $("#moreOptions").click(function(e) {
        popMore.show();
    });

}

var loadGrid = function(container, url, tblKey, cols) {
    var browserPanel = container + "_ZBrowserPanel",
        gridContainer = container + "_GridContainer";

    $("#" + container).empty();
    $("#" + container).append('<div id="' + browserPanel + '">');
    $("#" + browserPanel).append(
        '<div id="' + gridContainer + "\"></div><div id='grdMnu'></div>"
    );

    var makeAsyncDataSource = function(jsonFile) {
        return new DevExpress.data.CustomStore({
            loadMode: "raw",
            key: tblKey,
            load: function() {
                return $.get(jsonFile);
            },
            remove: function(key) {
                $.ajax({
                    url: "/del_zysUsuarios",
                    data: {
                        UsuarioId: key.UsuarioId
                    },
                    type: "DELETE",
                    dataType: "json", // this bit here
                    success: function(response) {
                        toastr.success("Datos borrados correctamente", "Operación exitosa");
                        dataGrid.refresh();
                    },
                    error: function(error) {
                        toastr.error("Error al borrar los datos (del_zysUsuarios: " + error.statusText + "-" + error.status + ")", "Intenta de nuevo");
                        console.log(error);
                    },
                });
            },
        });
    };

    dataGrid = $("#" + gridContainer)
        .dxDataGrid({
            dataSource: makeAsyncDataSource(url),
            columnChooser: {
                allowSearch: true,
                height: 250,
                enabled: true,
            },
            customizeColumns: cols,
            columnHidingEnabled: true,
            allowColumnResizing: true,
            allowColumnReordering: true,
            hoverStateEnabled: true,
            paging: {
                pageSize: 10,
            },
            searchPanel: {
                visible: true,
            },
            filterRow: {
                visible: true,
                applyFilter: "auto",
            },
            loadPanel: {
                enabled: true,
                shading: true,
            },
            export: {
                enabled: true,
                fileName: "Zafirosoft Export",
                allowExportSelectedData: true,
            },
            columnResizingMode: "nextColumn",
            columnAutoWidth: true,
            showBorders: false,
            showRowLines: true,
            showColumnLines: false,
            pager: {
                showPageSizeSelector: true,
                showNavigationButtons: true,
                showInfo: true,
                allowedPageSizes: [10, 25, 100],
            },
            grouping: {
                autoExpandAll: true,
                contextMenuEnabled: true,
            },
            groupPanel: {
                visible: true,
            },
            selection: {
                allowSelectAll: true,
                deferred: false,
                mode: "multiple",
                selectAllMode: "allPages",
                showCheckBoxesMode: "none",
            },
            filterPanel: {
                visible: true,
            },
            headerFilter: {
                allowSearch: true,
                visible: true,
            },
            rowAlternationEnabled: false,
            sorting: {
                mode: "multiple",
            },
            editing: {
                mode: "popup",
                useIcons: true,
                allowUpdating: false,
                allowDeleting: true,
                allowAdding: false,
                form: {
                    colCountByScreen: {
                        "xs": 1,
                        "md": 3,
                        "sm": 2,
                        "lg": 4
                    }
                }
            },
            stateStoring: {
                enabled: true,
                type: "localStorage",
                storageKey: "storage",
            },
            onContentReady: function(e) {
                var grid = e.component;
                var selection = grid.getSelectedRowKeys();
                if (selection.length == 0) {
                    grid.selectRowsByIndexes([0]);
                }
            },
            onToolbarPreparing: function(e) {
                e.toolbarOptions.items.unshift({
                    location: "after",
                    widget: "dxButton",
                    locateInMenu: "auto",
                    showText: "inMenu",
                    options: {
                        icon: "refresh",
                        text: "Refrescar",
                        hint: "Volver a cargar los datos",
                        onClick: function() {
                            e.component.refresh();
                        }
                    }
                });
                e.toolbarOptions.items.unshift({
                    location: "after",
                    widget: "dxButton",
                    locateInMenu: "auto",
                    showText: "always",
                    cssClass: "btnInsert",
                    options: {
                        icon: "plus",
                        text: "Nuevo",
                        hint: "Crear un registro nuevo",
                        type: "default",
                        width: "110px",
                        elementAttr: {
                            id: "btnGridInsert"
                        },
                    }
                });
            }
        })
        .dxDataGrid("instance");
};

function loadHTML(html) {
    loadPanel.show();
    $("#contenido")
        .html("")
        .empty()
        .load("html/" + html);
}

function startDrag(e) {
    var foto = $(".btnFotoUsr img").attr("src") || null;
    $("body").on("mousemove", function(e) {
        var w = window.innerWidth - e.clientX;
        if (w < 320) {
            w = 320;
            $("#frmEdit").css("width", window.innerWidth - 320 + "px");
        } else {
            $("#frmEdit").css("width", e.clientX + "px");
        }
        $(".gridZone").css("width", w + "px");
    })
    $("body").on("mouseup", function(e) {
        $("#edit").dxForm("instance").repaint();
        $(".btnFotoUsr img").attr("src", foto);
        dataGrid.refresh();
        $("body").off("mouseup");
        $("body").off("mousemove");
    });
}

function formatDate(d) {
    if (d == null) return "0000/00/00";
    if (!(d instanceof Date)) d = new Date(d);
    return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2);
}