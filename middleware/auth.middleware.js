function isAdmin(req,res,next){
    req.session.isAdmin?next():res.redirect("/login")
}
export default isAdmin;