var sentiment = require('sentiment');
var sqlite3 = require('sqlite3').verbose(); 
var db = new sqlite3.Database('./billboard.db'); 
var fs = require('fs');
var http = require('http');
const baseurl = 'http://localhost:8080/';

var billboard;

db.serialize(function() {

      db.all('SELECT * FROM billboard', (err, rows) => {
            if(err) {
                  console.log(err)
            } else {
                  console.log('The billboard table has '+ rows.length + ' rows.');
            }
      })

      db.each('SELECT rowid, Song, Lyrics FROM billboard', (err, row) => {
            if(err) {
                 // console.log(err)
            } else {
                  let rowid = row.rowid;
                  let val = sentiment(row.Lyrics);
                  //console.log(row.Song, val.comparative);
                  db.run('UPDATE billboard SET Sentiment = ?, Score = ? WHERE rowid = ?', [val.comparative, val.score, rowid], (err) => {
                        if (err) {
                              console.log('Error ', err);
                        }
                  }); 
            }
            
      }, (err, res) => {
            //on complete
            console.log(res);
            db.all('SELECT rowId, Rank, Song, Artist, Year, Source, Sentiment, Score FROM billboard', (err, rows) => {
                                    if(err) {
                                          console.log(err)
                                    } else {
                                          console.log(rows.length)
                                          billboard = rows;
                                          console.log('billboard is now ', billboard.length)
                                          fs.writeFile("./billboard.js", 'var billboardData = ' + JSON.stringify(rows), function(err) {
                                                if(err) {
                                                    return console.log(err);
                                                }
                                            
                                                console.log("The file was saved!");
                                            }); 
            
                                    }
                              })
      })


      
      // db.all('SELECT rowid, Song, Lyrics FROM billboard WHERE rowid = 5100', (err, row) => {
      //       console.log(row);
      //       var rowid = row[0].rowid;
      //       console.log('rowid ', rowid);
      //       //var val = sentiment(row[0].Lyrics)
      //       val = null;
      //       //console.log('song ', row[0].Song ,'val ', val.comparative)
      //       db.serialize(function() {
      //             db.run('UPDATE billboard SET Sentiment = ? WHERE rowid = ?', [val,rowid], (err) => {
      //                   if(err) {
      //                         console.log(err);
      //                   } else {
      //                         console.log(this)
      //                   }
      //             })
      //             db.all('SELECT * FROM billboard WHERE rowid = 5100', (err, row) => {
      //                   if(err) {
      //                         console.log(err)
      //                   } else {
      //                         console.log(row)

      //                   }
      //             })

      //       })
            
      // })
      

})

