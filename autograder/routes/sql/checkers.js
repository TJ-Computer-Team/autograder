// async function grabChecker(id) { // not in use
//     return new Promise((resolve, reject) => {
//         pl.connect((err, client, release) => {
//             if (err) {
//                 console.log("Error getting client");
//                 resolve(false);
//             }
//             let qry = "SELECT * FROM checker WHERE id= $1";
//             client.query(qry, [id], (err, results) => {
//                 release();
//                 if (err) {
//                     console.log("An error occured while querying for checker", err);
//                     resolve(false);
//                 }
//                 if (results.rows.length == 0) {
//                     resolve(false);
//                 } else {
//                     let ret = {
//                         id: id,
//                         code: results.rows[0].code,
//                         lang: results.rows[0].lang
//                     }
//                     resolve(ret);
//                 }
//             });
//         });
//     });
// }

// async function addChecker(checkid, checkercode, lang) { // not in use
//     return new Promise((resolve, reject) => {
//         pl.connect((err, client, release) => {
//             if (err) {
//                 console.log("Error getting client");
//                 resolve(false);
//             }
//             let qry = `INSERT INTO checker (code, lang) VALUES ($1, $2) RETURNING id;`;
//             client.query(qry, [checkercode, lang], (err, results) => {
//                 release();
//                 if (err) {
//                     console.log("Error while querying");
//                     resolve(false);
//                 }
//                 resolve(true);
//             });
//         });
//     });
// }
// async function updateChecker(checkid, checkercode, lang) { // not in use
//     return new Promise((resolve, reject) => {
//         pl.connect((err, client, release) => {
//             if (err) {
//                 console.log("Error getting client");
//                 resolve(false);
//             }
//             let qry = `UPDATE CHECKER SET code=$1, lang=$2 WHERE id = $3;`;
//             client.query(qry, [checkercode, lang, checkid], (err, results) => {
//                 release();
//                 if (err) {
//                     console.log("Error while querying");
//                     resolve(false);
//                 }
//                 resolve(true);
//             });
//         });
//     });
// }

// module.exports = {
//     grabChecker: (id) => {
//         if (Number(id))
//             return grabChecker(id);
//     },
//     addChecker: (checkid, code, lang) => {
//         return addChecker(checkid, code, lang);
//     },
//     updateChecker: (checkid, code, lang) => {
//         return updateChecker(checkid, code, lang);
//     },
// };

