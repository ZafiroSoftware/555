const mariadb = require('mariadb'),
    pool = mariadb.createPool({
        host: '45.79.34.198',
        user: 'root',
        database: 'Test',
        password: 'Chuck2008+.',
        connectionLimit: 8
    }),
    Hapi = require('hapi'),
    server = Hapi.server({
        host: 'localhost', //"10.122.106.105",//'localhost',
        port: 8082
    }),
    clientes = [
        {
            cte: "ZAFIRO",
            bd: "db_zafiro_erp",
            usr: "zsoft",
            pwd: "A2sTM3_O"
        }
    ],
    encripta = require('./js/Decrypt.js');

routes = [
    {
        method: "DELETE",
        path: "/del_zysUsuarios",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call del_zysUsuarios(?)", [
                    req.payload.UsuarioId
                ]);
                return res;
            } catch (err) {
                console.log("Error al llamar del_zysUsuarios=" + err)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar del_zysUsuarios");
                }
            }
        }
    },
    {
        method: "POST",
        path: "/upd_zysUsuarios",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call upd_zysUsuarios(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                    req.payload.UsuarioId,
                    req.payload.Usuario,
                    encripta.encrypt(req.payload.Password),
                    req.payload.Nombre,
                    req.payload.Activo,
                    req.payload.Correo,
                    req.payload.Genero,
                    req.payload.Foto,
                    req.payload.Cumpleanos,
                    req.payload.Aniversario,
                    req.payload.Conyuge,
                    req.payload.Puesto,
                    req.payload.Celular,
                    req.payload.TelefonoTrabajo,
                    req.payload.TelefonoCasa,
                    req.payload.Tipo,
                    req.payload.Sangre,
                    req.payload.Notas
                ]);
                return res;
            } catch (err) {
                console.log("Error al llamar upd_zysUsuarios=" + err)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar upd_zysUsuarios");
                }
            }
        }
    },
    {
        method: "POST",
        path: "/ins_zysUsuarios",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call ins_zysUsuarios(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                    req.payload.Usuario,
                    encripta.encrypt(req.payload.Password),
                    req.payload.Nombre,
                    req.payload.Activo,
                    req.payload.Correo,
                    req.payload.Genero,
                    req.payload.Foto,
                    req.payload.Cumpleanos,
                    req.payload.Aniversario,
                    req.payload.Conyuge,
                    req.payload.Puesto,
                    req.payload.Celular,
                    req.payload.TelefonoTrabajo,
                    req.payload.TelefonoCasa,
                    req.payload.Tipo,
                    req.payload.Sangre,
                    req.payload.Notas
                ]);
                return res;
            } catch (err) {
                console.error("Error al llamar ins_zysUsuarios=" + err.code)
                console.log(err)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.error("Error al conectar ins_zysUsuarios");
                }
            }
        }
    },
    {
        method: "POST",
        path: "/test",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call test(?,?)", [req.payload.Valor, req.payload.Foto]);
                return res;
            } catch (err) {
                console.log("Error al llamar insTable=" + err.code)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar insTable");
                }
            }
        }
    },
    {
        method: "GET",
        path: "/ValidaCliente",
        handler: async function(req) {
            var cliente = req.query.cliente.toString().toUpperCase();
            return (
                clientes.filter(function(c) {
                    return c.cte == cliente;
                }).length > 0
            );
        },
    },
    {
        method: "GET",
        path: "/tableApps",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call zysModulosSel()");
                return res[0];
            } catch (err) {
                console.log("Error al llamar zysModulosSel=" + err.code)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar zysModulosSel");
                }
            }
        },
    },
    {
        method: "GET",
        path: "/zysUsuariosSel",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call zysUsuariosSel()");
                res[0].map( r => {
                    r.Password = encripta.decrypt(r.Password);
                    return r;
                });
                return res[0];
            } catch (err) {
                console.log("Error al llamar zysUsuariosSel=" + err.code)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar zysUsuariosSel");
                }
            }
        }
    },
    {
        method: "GET",
        path: "/Menus",
        handler: async function(req) {
            let conn;
            try {
                conn = await pool.getConnection();
                const res = await conn.query("call zysMenusSel()");
                return res[0];
            } catch (err) {
                console.log("Error al llamar zysModulosSel=" + err.code)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar zysMenusSel");
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/ValidarUsuarioZERP',
        handler: async function(req) {
            let conn;
            let para = req.query;
            let resultado = {};
            let pass = encripta.encrypt(para.Password);
            try {
                // const res = await conn.query("SELECT zysUsuarios SET Password='" + encrypt("123") +"' WHERE UsuarioID=1");
                //return res;
                conn = await pool.getConnection();
                const res = await conn.query("call wb_ObtenerUsuario('" + para.Usuario + "')");
                if (typeof res[0][0] === 'undefined') {
                    resultado.Password = 1; // "No se encontró el usuario";
                } else {
                    if (pass == res[0][0].Password) {
                        resultado = res[0][0];
                        resultado.Password = 0; //"OK";
                    } else {
                        resultado.Password = 2; //"Contraseña incorrecta";
                    }
                }
                return resultado;
            } catch (err) {
                console.log("Error al llamar zysModulosSel=" + err.code)
                return err;
            } finally {
                if (conn) {
                    conn.end();
                } else {
                    console.log("Error al conectar wb_ObtenerUsuario");
                }
            }
        }
    }
];

module.exports = routes;

server.route(routes);

async function start() {
    try {
        await server.register(require('inert'));
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: './',
                    redirectToSlash: true,
                    index: true
                }
            }
        });
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Zafirosoft Linux Node.js Server running at:', server.info.uri);
}

start();