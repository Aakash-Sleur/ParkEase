import User from "../models/user.model";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY!
    );

    const { password: user_password, ...rest } = user.toObject();

    return res
      .cookie("accessToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(rest);
  } catch (error) {
    return res.status(500).send(`Internal Error: ${error}`);
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, bio, phone, address } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    if (!username || !email || !password || !bio || !phone || !address) {
      return res.sendStatus(400).json({ message: "All fields are required" });
    }

    const newUser = new User({
      username,
      email,
      password: hash,
      bio,
      phone,
      address,
    });

    if (!newUser) {
      return res.sendStatus(400).send("Something went wrong");
    }

    newUser.save();

    return res.status(201).json(newUser).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500).json(`Internal Error: ${error}`);
  }
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("Logged out successfully");
};
