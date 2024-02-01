const jwt = require("jsonwebtoken");
const Model = require("../Models/userSchema")
const JWT_SECRET = "AAjhhhdjsjjsfjkhfjNavneetYadav"


module.exports.getToken = (data) =>
  jwt.sign(data,JWT_SECRET, { expiresIn: "30 days" });

module.exports.verifyToken = (token) =>
  jwt.verify(token, JWT_SECRET);

module.exports.verify =
  (...args) =>
  async (req, res, next) => {
    try {
    //   console.log(" auth ",req.headers.authorization)
      const roles = [].concat(args).map((role) => role.toLowerCase());
      const token = String(req.headers.authorization || "")
        .replace(/bearer|jwt/i, "")
        .replace(/^\s+|\s+$/g, "");
      let decoded;
    //   console.log(token, "tokennn");
      if (token) decoded = this.verifyToken(token);
    //   console.log(token, "tokennn");
      let doc = null;
      let role = "";
      if (!decoded && roles.includes("guest")) {
        role = "guest";
        return next();
      }
      
      if (roles.includes("user")) {
        role = "user";
        // console.log('Decoded Token:', decoded,roles);
        doc = await Model.findOne({
        //   _id: decoded._id,
          token: token,
          
        });
      }
      if (roles.includes("admin")) {
        role = "admin";
        doc = await Model.findOne({
        //   _id: decoded._id,
          token: token,
         
        });
      }
      
    //   if (!doc) throw new Error("INVALID_TOKEN"); 
      if (!doc){
        res.json({msg:"Invalid_Token"})
      } ; 
      if (role) req[role] = doc.toJSON();
      // proceed next
      next();
    } catch (error) {
      console.error(error);
      const message =
        String(error.name).toLowerCase() === "error"
          ? error.message
          : "UNAUTHORIZED_ACCESS";
      return res.json(402, message);
    }
  };

  