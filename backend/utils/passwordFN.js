import bcrypt from 'bcrypt';

export const hashedPassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password,salt);
}

export const comparePassword = async(password,hashPassword)=>{
    return bcrypt.compare(password,hashPassword);
}