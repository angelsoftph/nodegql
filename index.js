const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2');
const cors = require('cors');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'legalmatch'
});

const schema = buildSchema(`
    type EmployeeView {
        id: ID!
        fname: String!
        lname: String!
        street: String
        city: String
        contact: String
        age: Int!
        tenure: String!
    }

    type Address {
        id: ID!
        employee_id: Int!
        street: String!
        city: String!
        is_primary: Int!
    }

    type Contact {
        id: ID!
        employee_id: Int!
        contact: String!
        is_primary: Int!
    }

    type EmployeeUpdate {
        id: ID!
        fname: String!
        lname: String!
        mname: String!
        bdate: String!
        gender: String!
        cstatus: String!
        position: String!
        datehired: String!
        tenure: String!
    }

    input AddressInput {
        street: String!
        city: String!
        is_primary: Boolean!
    }

    input ContactInput {
        contact: String!
        is_primary: Boolean!
    }

    type Query {
        employees: [EmployeeView]
        employee(id: ID!): EmployeeUpdate
        addresses(employee_id: ID!): [Address]
        address(id: ID!): Address
        contacts(employee_id: ID!): [Contact]
        contact(id: ID!): Contact
    }

    type Mutation {
        createEmployee(
            fname: String!,
            lname: String!,
            mname: String!,
            bdate: String!,
            gender: String!,
            cstatus: String!,
            position: String!,
            datehired: String!,
            tenure: String!
        ): EmployeeUpdate
        updateEmployee(
            id: ID!,
            fname: String!,
            lname: String!,
            mname: String!,
            bdate: String!,
            gender: String!,
            cstatus: String!,
            position: String!,
            datehired: String!,
            tenure: String!
        ): EmployeeUpdate
        deleteEmployee(id: ID!): String

        createAddress(employee_id: ID!, street: String!, city: String!, is_primary: Int!): Address
        updateAddress(id: ID!, street: String!, city: String!, is_primary: Int!): Address
        deleteAddress(id: ID!): Address
        setPrimaryAddress(id: ID!, employee_id: ID!): Address

        createContact(employee_id: ID!, contact: String!, is_primary: Int!): Contact
        updateContact(id: ID!, contact: String!, is_primary: Int!): Contact
        deleteContact(id: ID!): Contact
        setPrimaryContact(id: ID!, employee_id: ID!): Contact
    }
`);

function getAge(bdate) {
    if (!bdate) {
        return 0;
    }

    const birthDate = new Date(bdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

const root = {
    employees: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    e.id,
                    e.fname,
                    e.lname,
                    e.mname,
                    e.bdate,
                    e.gender,
                    e.cstatus,
                    e.position,
                    e.datehired,
                    a.street,
                    a.city,
                    c.contact,
                    e.tenure
                FROM employees e
                LEFT JOIN addresses a ON a.employee_id = e.id
                    AND a.is_primary = 1
                LEFT JOIN contacts c ON c.employee_id = e.id
                    AND c.is_primary = 1;
            `;
            db.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const employees = results.map(row => {
                        return {
                            ...row,
                            age: getAge(row.bdate)
                        };
                    });

                    resolve(employees);
                }
            });
        });
    },
    employee: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    addresses: ({ employee_id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM addresses WHERE employee_id = ?', [employee_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    address: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM addresses WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    contacts: ({ employee_id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM contacts WHERE employee_id = ?', [employee_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    contact: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM contacts WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    createEmployee: ({ fname, lname, mname, bdate, gender, cstatus, position, datehired, tenure }) => {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO employees (
                    fname,
                    lname,
                    mname,
                    bdate,
                    gender,
                    cstatus,
                    position,
                    datehired,
                    tenure
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [fname, lname, mname, bdate, gender, cstatus, position, datehired, tenure],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: result.insertId,
                            fname,
                            lname,
                            mname,
                            bdate,
                            gender,
                            cstatus,
                            position,
                            datehired,
                            tenure
                        });
                    }
                }
            );
        });
    },
    updateEmployee: ({ id, fname, lname, mname, bdate, gender, cstatus, position, datehired, tenure }) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (fname !== undefined) {
                fields.push('fname = ?');
                values.push(fname);
            }
            if (lname !== undefined) {
                fields.push('lname = ?');
                values.push(lname);
            }
            if (mname !== undefined) {
                fields.push('mname = ?');
                values.push(mname);
            }
            if (bdate !== undefined) {
                fields.push('bdate = ?');
                values.push(bdate);
            }
            if (gender !== undefined) {
                fields.push('gender = ?');
                values.push(gender);
            }
            if (cstatus !== undefined) {
                fields.push('cstatus = ?');
                values.push(cstatus);
            }
            if (position !== undefined) {
                fields.push('position = ?');
                values.push(position);
            }
            if (datehired !== undefined) {
                fields.push('datehired = ?');
                values.push(datehired);
            }
            if (tenure !== undefined) {
                fields.push('tenure = ?');
                values.push(tenure);
            }
            values.push(id);

            const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;

            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    },
    deleteEmployee: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`Employee with ID ${id} deleted successfully.`);
                }
            });
        });
    },
    createAddress: ({ employee_id, street, city, is_primary }) => {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO addresses (
                    employee_id,
                    street,
                    city,
                    is_primary
                ) VALUES (?, ?, ?, ?)`,
                [employee_id, street, city, is_primary],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: result.insertId,
                            employee_id,
                            street,
                            city,
                            is_primary
                        });
                    }
                }
            );
        });
    },
    updateAddress: ({ id, street, city, is_primary }) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (street !== undefined) {
                fields.push('street = ?');
                values.push(street);
            }
            if (city !== undefined) {
                fields.push('city = ?');
                values.push(city);
            }
            if (is_primary !== undefined) {
                fields.push('is_primary = ?');
                values.push(is_primary);
            }
            values.push(id);

            const sql = `UPDATE addresses SET ${fields.join(', ')} WHERE id = ?`;

            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    db.query('SELECT * FROM addresses WHERE id = ?', [id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    },
    deleteAddress: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM addresses WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`Address with ID ${id} deleted successfully.`);
                }
            });
        });
    },
    createContact: ({ employee_id, contact, is_primary }) => {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO contacts (
                    employee_id,
                    contact,
                    is_primary
                ) VALUES (?, ?, ?)`,
                [employee_id, contact, is_primary],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: result.insertId,
                            employee_id,
                            contact,
                            is_primary
                        });
                    }
                }
            );
        });
    },
    updateContact: ({ id, contact, is_primary }) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (contact !== undefined) {
                fields.push('street = ?');
                values.push(street);
            }
            if (is_primary !== undefined) {
                fields.push('is_primary = ?');
                values.push(is_primary);
            }
            values.push(id);

            const sql = `UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`;

            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    db.query('SELECT * FROM contacts WHERE id = ?', [id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    },
    deleteContact: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM contacts WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`Contact with ID ${id} deleted successfully.`);
                }
            });
        });
    },
    setPrimaryAddress: ({ id, employee_id }) => {
        return new Promise((resolve, reject) => {
            const sql0 = `UPDATE addresses SET is_primary = 0 WHERE employee_id = ?`;
            const sql1 = `UPDATE addresses SET is_primary = 1 WHERE id = ?`;

            db.query(sql0, [employee_id], (err, result) => {
                if (err) {
                    reject(err);
                }
            });

            db.query(sql1, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    db.query('SELECT * FROM addresses WHERE id = ?', [id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    },
    setPrimaryContact: ({ id, employee_id }) => {
        console.log('id', id);
        console.log('emp', employee_id);
        return new Promise((resolve, reject) => {
            const sql0 = `UPDATE contacts SET is_primary = 0 WHERE employee_id = ?`;
            const sql1 = `UPDATE contacts SET is_primary = 1 WHERE id = ?`;

            db.query(sql0, [employee_id], (err, result) => {
                if (err) {
                    reject(err);
                }
            });

            db.query(sql1, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    db.query('SELECT * FROM contacts WHERE id = ?', [id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    }
};

const app = express();

app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(9000, () => {
    console.log('GraphQL server running at http://localhost:9000/graphql');
});
