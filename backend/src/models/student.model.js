const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    studentCode: { type: DataTypes.STRING, allowNull: false, unique: true },
    registrationNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: true },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },

    // Original fields
    departmentId: { type: DataTypes.UUID, allowNull: true },
    courseId: { type: DataTypes.UUID, allowNull: true },
    classId: { type: DataTypes.UUID, allowNull: true },
    year: { type: DataTypes.STRING, allowNull: true },
    semester: { type: DataTypes.STRING, allowNull: true },

    // New Injibara University fields
    collegeId: { type: DataTypes.UUID, allowNull: true },
    programId: { type: DataTypes.UUID, allowNull: true },
    batchId: { type: DataTypes.UUID, allowNull: true },
    academicYearId: { type: DataTypes.UUID, allowNull: true },
    semesterId: { type: DataTypes.UUID, allowNull: true },
    sectionId: { type: DataTypes.UUID, allowNull: true },

    // Guardian info
    guardianName: { type: DataTypes.STRING, allowNull: true },
    guardianPhone: { type: DataTypes.STRING, allowNull: true },
    admissionDate: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'),
      defaultValue: 'ACTIVE',
    },
  }, {
    tableName: 'students',
    timestamps: true,
  });

  return Student;
};