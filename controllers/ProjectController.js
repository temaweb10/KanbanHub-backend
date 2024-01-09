import ProjectModel from "../models/Project.js";

export const createProject = async (req, res) => {
  try {
    console.log(req.body);
    const doc = new ProjectModel({
      nameProject: req.body.nameProject,
      status: req.body.status,
      creator: req.body.creatorId,
    });

    const project = await doc.save();

    res.json(project);
  } catch (error) {
    console.log(error);
    res.json({ message: "Не создать проект" });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "sercetkeyy",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({ ...userData, token });
  } catch (error) {
    res.json({ message: "Не удалось авторизоваться" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { ...userData } = user._doc;

    res.json({ ...userData });
  } catch (error) {
    res.status(500).json({ message: "Нет доступа" });
  }
};
