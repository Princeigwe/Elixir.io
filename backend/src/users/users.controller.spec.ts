import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {UsersService } from './users.service';


describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    createUser:  jest.fn((email: string, password: string) => (
        {
          email: email,
          password: password,
          _id: "1234567",
          __v: 0
      }
    )),

    getUsers:  jest.fn( () => ([
      
      {
        email: "testuser@gmail.com",
        password: "testpass123",
        _id: "1234567",
        __v: 0
    },
    {
      email: "testuser2@gmail.com",
      password: "testpass123",
      _id: "12345678",
      __v: 0
    }

    ]) ),


    getUserByEmail: jest.fn( (email: string) => {
      return {
        email: "testuser@gmail.com",
        password: "testpass123",
        _id: "1234567",
        __v: 0
      }
    } )
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService]
    }).overrideProvider(UsersService)
      .useValue(mockUsersService) // todo: custom provider (check Testing documentation)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  // it('should create a User', async () => {
  //   expect(await controller.createUser({email: "testuser@gmail.com", password: "testpass123"})).toEqual(
  //     {
  //       email: "testuser@gmail.com",
	//       password: "testpass123",
	//       _id: "1234567",
	//       __v: 0
  //     }
  //   )
  // })


  it("should return array of users", async () => {
    let users = [ {
        email: "testuser@gmail.com",
        password: "testpass123",
        _id: "1234567",
        __v: 0
    },
      {
        email: "testuser2@gmail.com",
        password: "testpass123",
        _id: "12345678",
        __v: 0
    } ]
    expect(await controller.getUsers()).toEqual(users)
  })


  it("should return a user by email", async () => {
    let user = {
          email: "testuser@gmail.com",
          password: "testpass123",
          _id: "1234567",
          __v: 0
      }
    expect(await controller.getUsers("testuser@gmail.com")).toEqual(user)
  })

  // todo: check on how to return an exception in unit test
  // it("should not get a user by email", async () =>{
  //   let user = {
  //     email: "testuser@gmail.com",
  //     password: "testpass123",
  //     _id: "1234567",
  //     __v: 0
  // }
  //   expect(await controller.getUsers("testuser4@gmail.com")).toEqual(user)
  // })

});
