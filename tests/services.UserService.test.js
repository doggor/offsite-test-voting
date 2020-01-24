const UserService = require("../services/UsersService");
const User = require("../models/User");
const redis = require("../utils/redis");
const ForbiddenError = require("../errors/ForbiddenError");
const InvalidDataError = require("../errors/InvalidDataError");

jest.mock("../models/User");
jest.mock("../utils/redis");

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("add user", () => {
    it("should successfully add a user", async () => {
        const result = await UserService.addUser({
            hkid: "A5555550"
        });

        expect(redis.getNewUserOffset).toHaveBeenCalled();

        expect(User.create).toHaveBeenCalledWith({
            hkidHash: "fb1de4c0034eed393cc7103270807fb44f9deb9483425aa243006736a0ecf81e",
            offset: 0,
        });

        expect(result).toMatchObject({
            id: "id_user_new",
        });
    });
});

describe("list users", () => {
    it("should successfully list users", async () => {
        const result = await UserService.listUser();

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(1);
        expect(result[0]).toMatchObject({
            id: "id_user_1",
        });
    });
});
