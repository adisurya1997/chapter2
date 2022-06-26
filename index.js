const express = require('express')

const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')

const db = require('./connection/db')
const upload = require('./middlewares/fileUpload')

const app = express()
const port = process.env.PORT || 8000



app.set('view engine', 'hbs')

app.use(flash())

app.use(session({
    secret: 'bebas',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 3 * 60 * 60 * 1000 // 3 JAM
     }
}))

app.use('/assets', express.static(__dirname + '/assets')) 
app.use('/uploads', express.static(__dirname + '/uploads')) 
app.use(express.urlencoded({extended: false}))

//let isLogin = true

db.connect(function(err, client, done){
    if (err) throw err // menampilkan error koneksi database

    
    app.get('/contact', function(request, response){
        response.render('contact',{user: request.session.user, isLogin: request.session.isLogin})
    })
    

    app.get('/', function(request, response){

        db.connect(function(err, client, done){
            if (err) throw err // menampilkan error koneksi database
            
            const query = `SELECT tb_properties.id, tb_user.name as author, tb_properties.name, start_date, end_date, tb_properties.description, tb_properties.technologies, image, tb_properties.author_id
            FROM public.tb_properties LEFT JOIN tb_user ON tb_properties.author_id = tb_user.id`

            client.query(query, function(err, result){
                if (err) throw err
                let data = result.rows
    
                let dataBlog = data.map(function(item){
                    return {
                        ...item,
                        duration: getDuration(item.start_date,item.end_date),
                        isLogin: request.session.isLogin
                    }
                })

                let filterdata

                if (request.session.user){
                    filterdata = dataBlog.filter((item) => {
                    
                        return item.author_id === request.session.user.id
                        
                    })
                    
                }
                let resultBlog = request.session.user ? filterdata : dataBlog 
                //console.log(resultBlog)
                response.render('index',{blogs: resultBlog, user: request.session.user, isLogin: request.session.isLogin})
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
                    nodeJs: data.technologies[0] !== "undefined",
                    reactJs: data.technologies[1] !== "undefined",
                    android: data.technologies[2] !== "undefined",
                    javascript: data.technologies[3] !== "undefined",
                    duration: getDuration(data.start_date,data.end_date),
                    endDate : getFullTime(data.end_date),
                    startDate : getFullTime(data.start_date)
                }

                response.render('project-detail', data)
            })
    })

    app.get('/addproject', function(request, response){
        if(!request.session.user){
            request.flash('danger', 'Anda belum login!')
            return response.redirect('/login')
        }
        response.render('addproject')
    })

    app.post('/addproject', upload.single('inputImage'), function(request, response){

        const data = request.body
        const authorId = request.session.user.id
        const image = request.file.filename

        const query = `INSERT INTO tb_properties(
             name, start_date, end_date, description, technologies, image, author_id)
            VALUES (' ${data.inputtitle}', '${data.inputprojectstartdate}', '${data.inputprojectenddate}', '${data.inputmessage}', ARRAY ['${data.nodejs}', '${data.reactjs}', '${data.android}', '${data.javascript}'], '${image}', '${authorId}' )`;

        client.query(query, function(err, result){
            if(err) throw err

            response.redirect('/')
        })

    })

    app.get('/deleteproject/:id', function(request, response){

        if(!request.session.user){
            request.flash('danger', 'Anda belum login!')
            return response.redirect('/login')
        }

        const id = request.params.id
        const query = `DELETE FROM public.tb_properties WHERE id=${id};`

        client.query(query, function(err, result){
            if(err) throw err

            response.redirect('/')
        })
    })

    app.get("/update-project/:id", function (request, response) {
        if(!request.session.user){
            request.flash('danger', 'Anda belum login!')
            return response.redirect('/login')
        }

        let id = request.params.id;
        
        client.query(`SELECT * FROM public.tb_properties WHERE id=${id};`, function(err, result){
            if (err) throw err
            let edit = result.rows[0]
            
            
            response.render("update-project", {user: request.session.user, isLogin: request.session.isLogin, edit, id});
        })
    
    })

    app.post("/update-project/:id", upload.single('Inputimage'), function (request, response) {
        let data = request.body;
        let id = request.params.id;
        const image = request.file.filename

        const query = `UPDATE public.tb_properties
        SET name='${data.inputtitle}', start_date='${data.inputprojectstartdate}', end_date='${data.inputprojectenddate}', description='${data.inputmessage}', technologies='{"${data.nodejs}","${data.reactjs}","${data.android}","${data.javascript}"}',image='${image}'
        WHERE id=${id};`
        client.query(query, function(err, result){
            if(err) throw err

        response.redirect('/')})
    
    })

    app.get('/register', function(request, response){
        response.render('register')
    })

    app.post('/register', function(req,res){
        let {inputname, inputemail, inputpassword} = req.body
        const hashedPassword = bcrypt.hashSync(inputpassword, 10)
        //salt round hash 10

        const cekEmail = `SELECT * FROM tb_user WHERE email='${inputemail}'`;
        client.query(cekEmail, function (err, result) {
            if (err) throw err;

            if (result.rows.length != 0) {
                req.flash("danger", "Email sudah terdaftar");
                return res.redirect("/register");
            }
            const query = `INSERT INTO tb_user(name, email, password)
            VALUES ('${inputname}', '${inputemail}', '${hashedPassword}');`

            client.query(query, function(err, result){
                if(err) throw err

                res.redirect('/login')
            })
        })

    })

    app.get('/login', function(request, response){
        response.render('login')
    })

    app.post('/login', function(req,res){

        let {inputemail, inputpassword} = req.body

        const query = `SELECT * FROM tb_user WHERE email='${inputemail}'`

        client.query(query, function(err, result){
            if(err) throw err


            if(result.rows.length == 0){
                req.flash('danger', 'Email belum terdaftar')
                return res.redirect('/login')
            }

            const isMatch = bcrypt.compareSync(inputpassword, result.rows[0].password)

            if(isMatch){
                req.session.isLogin = true
                req.session.user = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    email: result.rows[0].email,
                }

                req.flash('success', 'Login Success')
                res.redirect('/')

            } else {
                req.flash('danger', 'Password tidak cocok!')
                res.redirect('login')
            }
        })

    })

    app.get('/logout', function(req,res){
        req.session.destroy()

        res.redirect('/')
    })

})




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