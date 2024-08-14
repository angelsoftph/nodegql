Just run `npm install` and then `npm run dev`. This will launch a GraphQL server at http://localhost:9000/graphql

Here are some test queries that you can try:

Retrieve all employees:
`{
  employees {
    id
    name
    street
    city
    contact
    age
    tenure
  }
}`

Retrieve a specific employee:
```{
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
}```

Retrieve addresses of an employee:
```{
	addresses(employee_id: 1) {
  	id
    employee_id
  	street
  	city
    is_primary
  }
}```

Create a new employee:
```mutation {
  createEmployee(
    name: "Harry Potter",
    age: 40,
    tenure: "3y 6m"
  ) {
    name
    age
    tenure
  }
}```

Delete an employee:
```mutation {
  deleteEmployee(id: 5)
}```
