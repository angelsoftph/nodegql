Just run `npm install` and then `node index`. This will launch a GraphQL server at http://localhost:9000/graphql

Here are some test queries that you can try:

```
Retrieve all employees:
{
  employees {
    id
    name
    street
    city
    contact
    age
    tenure
  }
}

Retrieve a specific employee:
{
  employee(id: 1) {
    fname
    lname
    mname
    bdate
    gender
    cstatus
    position
    datehired
    address
    contact
    age
    tenure
  }
}

Retrieve addresses of an employee:
{
  addresses(employee_id: 1) {
    id
    employee_id
    street
    city
    is_primary
  }
}

Create a new employee:
mutation {
  createEmployee(
    fname: "Maria",
    lname: "Palad",
    mname: "Kapos",
    bdate: "2006-06-09"
    gender: "F",
    cstatus: "S",
    position: "Customer Service",
    datehired: "2024-06-01"
  ) {
    fname
    lname
    fname
    bdate
    gender
    cstatus
    position
    datehired
  }
}

Update an employee:
mutation {
  updateEmployee(
    id: 15,
    fname: "Jenny"
    lname: "Potter"
    mname: "Wallah"
    bdate: "1991-04-30"
    gender: "F"
    cstatus: "D"
    position: "Lady Boss"
    datehired: "2022-01-01"
  ) {
    id
    fname
    lname
    mname
    bdate
    gender
    cstatus
    position
    datehired
  }
}

Delete an employee:
mutation {
  deleteEmployee(id: 5)
}
```
