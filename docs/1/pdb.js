


var db = {
	countries: new PouchDB('countries'),
	airports: new PouchDB('airports'),
};


//function dbcountries_add(d) {
//	if (!d._id)
//  var todo = {
//    _id: d.id,
//    title: text,
//    completed: false
//  };
//  dbcountries.put(todo, function callback(err, result) {
//    if (!err) {
//      console.log('Successfully posted a todo!');
//    }
//  });
//}