const express = require('express')

const app = express()
const port = 8000

const db = require('./connection/db')

app.set('view engine', 'hbs')

app.use('/assets', express.static(__dirname + '/assets')) 
app.use(express.urlencoded({extended: false}))

let isLogin = true

db.connect(function(err, client, done){
    if (err) throw err // menampilkan error koneksi database

    
    app.get('/contact', function(request, response){
        response.render('contact',{isLogin})
    })
    

    app.get('/', function(request, response){

        db.connect(function(err, client, done){
            if (err) throw err // menampilkan error koneksi database
    
            client.query('SELECT * FROM tb_properties', function(err, result){
                if (err) throw err
                let data = result.rows
    
                let dataBlog = data.map(function(item){
                    return {
                        ...item,
                        duration: getDuration(item.start_date,item.end_date),
                        isLogin
                    }
                })
    
                response.render('index',{isLogin, blogs: dataBlog})
            })
        })
    
    })

    app.get('/project-detail/:id', function(request, response){

        let id = request.params.id

            client.query(`SELECT * FROM public.tb_properties WHERE id=${id}`, function(err, result){
                if (err) throw err
                let data = result.rows[0]
                data = {
                    title: data.name,
                    image: data.image,
                    content: data.description,
                    duration: getDuration(data.start_date,data.end_date),
                    endDate : getFullTime(data.end_date),
                    startDate : getFullTime(data.start_date)
                }

                response.render('project-detail', data)
            })
    })

    app.get('/addproject', function(request, response){
        response.render('addproject',{isLogin})
    })

    app.post('/addproject', function(request, response){

        const data = request.body

        const query = `INSERT INTO tb_properties(
             name, start_date, end_date, description)
            VALUES (' ${data.inputtitle}', '${data.inputprojectstartdate}', '${data.inputprojectenddate}', '${data.inputmessage}');`

        client.query(query, function(err, result){
            if(err) throw err

            response.redirect('/')
        })

    })

    app.get('/deleteproject/:id', function(request, response){

        const id = request.params.id
        const query = `DELETE FROM public.tb_properties WHERE id=${id};`

        client.query(query, function(err, result){
            if(err) throw err

            response.redirect('/')
        })
    })

    app.get("/update-project/:id", function (request, response) {
        let id = request.params.id;
        
        client.query(`SELECT * FROM public.tb_properties WHERE id=${id};`, function(err, result){
            if (err) throw err
            let edit = result.rows[0]
            
            
            response.render("update-project", {isLogin: isLogin, edit, id});
        })
    
    })

    app.post("/update-project/:id", function (request, response) {
        let data = request.body;
        let id = request.params.id;

        const query = `UPDATE public.tb_properties
        SET name='${data.inputtitle}', start_date='${data.inputprojectstartdate}', end_date='${data.inputprojectenddate}', description='${data.inputmessage}'
        WHERE id=${id};`
        client.query(query, function(err, result){
            if(err) throw err

        response.redirect('/')})
    
    })

})



function geticonr(reactjs){
    let r = reactjs;

    if (r == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticona(android){
    let a = android;

    if (a == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticonn(nodejs){
    let n = nodejs;

    if (n == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticonj(javascript){
    let j = javascript;

    if (j == "true"){
        return "true"
    }else{
        return "false"
    }
}
function getFullTime(waktu){
    let month =  ['Januari', 'Febuari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober' , 'November' , 'Desember']

    let date = waktu.getDate()
    let monthIndex = waktu.getMonth()
    let year = waktu.getFullYear()

    let fullTime = `${date} ${month[monthIndex]} ${year} `
    return fullTime
}
function getDuration(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let duration = end.getTime() - start.getTime();
    let month = Math.round(duration / (1000 * 3600 * 24 * 30));
    if (month < 1) {
      return "< 1";
    }else {
      return month;
    }
}
app.listen(port, function(){
    console.log(`Server running on port ${port}`);
})