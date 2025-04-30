const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
	console.error('JWT_SECRET is not defined in environment variables');
}

exports.registerUser = async (req, res) => {	
	const { name, email, password, phone } = req.body;

	if (!name || !email || !password || !phone) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'Email is already registered' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			phone,
		});

		await newUser.save();

		res.status(201).json({ message: 'User registered successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

exports.loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' });
	}
	try {
		console.log(`Attempting to find user with email: ${email}`);
		const user = await User.findOne({ email });
		if (!user) {
			console.log('User not found');
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		console.log('User found, verifying password...');
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			console.log('Password validation failed');
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		console.log('Password valid, creating token...');

		// Use the hard-coded secret value if environment variable is not available
		const jwtSecret =
			process.env.JWT_SECRET ||
			'fe90468f0c9e60b686702d4583811ff5201c27e09d34035b2395c86e6e9513495653e10bc9f0e92f3ff7eeb3cd2d766cef35626d9b2791f232d1666b0a156a95';
		console.log('JWT_SECRET available:', !!jwtSecret);

		try {
			const token = jwt.sign(
				{ userId: user._id, email: user.email },
				jwtSecret,
				{
					expiresIn: '1h',
				}
			);
			console.log('Token created successfully');
			return res.status(200).json({ token });
		} catch (jwtError) {
			console.error('JWT signing error:', jwtError);
			return res
				.status(500)
				.json({ message: 'Error generating authentication token' });
		}
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};
