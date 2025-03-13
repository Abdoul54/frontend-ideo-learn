import { NextResponse } from 'next/server';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example data, replace with your actual data fetching logic
    const users = [
        {
            "id": 1,
            "firstName": "Andrew",
            "lastName": "Taylor",
            "email": "andrew.taylor@gmail.com",
            "age": 32,
            "city": "Paris"
        },
        {
            "id": 2,
            "firstName": "Michael",
            "lastName": "Wilson",
            "email": "michael.wilson@icloud.com",
            "age": 58,
            "city": "London"
        },
        {
            "id": 3,
            "firstName": "John",
            "lastName": "Miller",
            "email": "john.miller@outlook.com",
            "age": 48,
            "city": "New York"
        },
        {
            "id": 4,
            "firstName": "Christopher",
            "lastName": "Anderson",
            "email": "christopher.anderson@yahoo.com",
            "age": 27,
            "city": "Tokyo"
        },
        {
            "id": 5,
            "firstName": "Sarah",
            "lastName": "Brown",
            "email": "sarah.brown@hotmail.com",
            "age": 62,
            "city": "Sydney"
        },
        {
            "id": 6,
            "firstName": "Emily",
            "lastName": "Smith",
            "email": "emily.smith@gmail.com",
            "age": 38,
            "city": "London"
        },
        {
            "id": 7,
            "firstName": "David",
            "lastName": "Davis",
            "email": "david.davis@outlook.com",
            "age": 55,
            "city": "Paris"
        },
        {
            "id": 8,
            "firstName": "Jane",
            "lastName": "Williams",
            "email": "jane.williams@icloud.com",
            "age": 21,
            "city": "Tokyo"
        },
        {
            "id": 9,
            "firstName": "Matthew",
            "lastName": "Jones",
            "email": "matthew.jones@yahoo.com",
            "age": 45,
            "city": "New York"
        },
        {
            "id": 10,
            "firstName": "Daniel",
            "lastName": "Moore",
            "email": "daniel.moore@hotmail.com",
            "age": 60,
            "city": "Sydney"
        }
    ]

    return NextResponse.json(users);
}