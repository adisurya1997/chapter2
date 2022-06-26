function submitData(){

    let name = document.getElementById("input-name").value
    let email = document.getElementById("input-email").value
    let phone = document.getElementById("input-phone").value
    let subject = document.getElementById("input-subject").value
    let message = document.getElementById("input-message").value

    if(name == ''){
        return alert("Nama wajib diisi")
    } else if(email == ''){
        return alert("Email wajib diisi")
    } else if(phone == ''){
        return alert("Phone wajib diisi")
    } else if(subject == ''){
        return alert("Subject wajib diisi")
    } else if(message == ''){
        return alert("Pesan wajib diisi")
    }

    console.log(name);
    console.log(email);
    console.log(phone);
    console.log(subject);
    console.log(message);
    // <a href="mailto:user@mail.com?subject=Frontend&body=Hallo saya samsul">Send email</a>
    let emailReceiver = "admin@gmail.com"
    let a = document.createElement('a')

    a.href = `mailto:${emailReceiver}?subject=${subject}&body=Hallo nama saya ${name} ${message} silahkan hubungi ${phone} Email: ${email}`
    a.click()


}