const CampaignService = require("../services/CampaignsService");
const Campaign = require("../models/Campaign");
const redis = require("../utils/redis");
const ForbiddenError = require("../errors/ForbiddenError");
const InvalidDataError = require("../errors/InvalidDataError");
const NotFoundError = require("../errors/NotFoundError");

jest.mock("../models/Campaign");
jest.mock("../models/User");
jest.mock("../utils/redis");

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("add campaign", () => {
    it("should successfully create a campaign", async () => {
        const data = {
            name: "dummy1",
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            options: [
                { name: "dummy4" },
                { name: "dummy5" },
            ],
        };

        const result = await CampaignService.addCampaign(data);

        expect(Campaign.create).toHaveBeenCalledWith({
            name: data.name,
            start: new Date(data.start),
            end: new Date(data.end),
            options: data.options.map(o => ({ name: o.name, votes: 0 })),
            votes: 0,
        });

        const mockDoc = Campaign._mockData[0];
        expect(result).toMatchObject({
            id: mockDoc._id,
            name: mockDoc.name,
            start: mockDoc.start.toISOString(),
            end: mockDoc.end.toISOString(),
            options: mockDoc.options.map(option => ({
                id: option._id,
                name: option.name,
                votes: option.votes,
            })),
        });
    });
});

describe("delete campaign", () => {
    it("should successfully delete an existed campaign", async () => {
        await CampaignService.deleteCampaign("id_campaign_2");

        const targetCampaign = await Campaign.findOne({ _id: "id_campaign_2" }).exec();

        expect(targetCampaign.deletedAt).toBeDefined();
    });

    it("should fail to delete an non-existed campaign", async () => {
        expect.assertions(1);
        try {
            await CampaignService.deleteCampaign("id_campaign_0");
        }
        catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });
});

describe("find campaign", () => {
    it("should return a existed campaign without user info", async () => {
        const result = await CampaignService.findCampaign("id_campaign_2", undefined);

        const mockDoc = Campaign._mockData[0];
        expect(result).toMatchObject({
            id: mockDoc._id,
            name: mockDoc.name,
            start: mockDoc.start.toISOString(),
            end: mockDoc.end.toISOString(),
            options: mockDoc.options.map(option => ({
                id: option._id,
                name: option.name,
                votes: option.votes,
                voted: false,
            })),
        });
    });

    it("should return a existed campaign with valided user", async () => {
        const result = await CampaignService.findCampaign("id_campaign_2", "id_user_1");

        const mockDoc = Campaign._mockData[0];
        expect(result).toMatchObject({
            id: mockDoc._id,
            name: mockDoc.name,
            start: mockDoc.start.toISOString(),
            end: mockDoc.end.toISOString(),
            options: mockDoc.options.map(option => ({
                id: option._id,
                name: option.name,
                votes: option.votes,
                voted: /_option_2$/.test(option._id),
            })),
        });
    });

    it("should fail to return a non-existed campaign without user info", async () => {
        expect.assertions(1);
        try {
            await CampaignService.findCampaign("id_campaign_0", undefined);
        }
        catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });

    it("should fail to return a existed campaign with invalid user", async () => {
        expect.assertions(1);
        try {
            await CampaignService.findCampaign("id_campaign_1", "id_user_0");
        }
        catch (err) {
            expect(err).toBeInstanceOf(InvalidDataError);
        }
    });

    it("should fail to return a non-existed campaign with valid user", async () => {
        expect.assertions(1);
        try {
            await CampaignService.findCampaign("id_campaign_0", "id_user_1");
        }
        catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });

    it("should fail to return a non-existed campaign with invalid user", async () => {
        expect.assertions(1);
        try {
            await CampaignService.findCampaign("id_campaign_0", "id_user_0");
        }
        catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });
});

describe("list campaigns", () => {
    it("should successfully return campaign list without user info", async () => {
        const result = await CampaignService.listCampaigns(undefined);

        const mockDocs = Campaign._mockData;
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(mockDocs.length);
        for (let i = 0; i < result.length; i++) {
            const mockDoc = mockDocs[i];
            expect(result[i]).toMatchObject({
                id: mockDoc._id,
                name: mockDoc.name,
                start: mockDoc.start.toISOString(),
                end: mockDoc.end.toISOString(),
                options: mockDoc.options.map(option => ({
                    id: option._id,
                    name: option.name,
                    votes: option.votes,
                    voted: false,
                })),
            });
        }
    });

    it("should successfully return campaign list with valid user", async () => {
        const result = await CampaignService.listCampaigns("id_user_1");

        const mockDocs = Campaign._mockData;
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(3);
        for (let i = 0; i < result.length; i++) {
            const mockDoc = mockDocs[i];
            expect(result[i]).toMatchObject({
                id: mockDoc._id,
                name: mockDoc.name,
                start: mockDoc.start.toISOString(),
                end: mockDoc.end.toISOString(),
                options: mockDoc.options.map(option => ({
                    id: option._id,
                    name: option.name,
                    votes: option.votes,
                    voted: /_option_2$/.test(option._id),
                })),
            });
        }
    });

    it("should fail to return campaign with invalid user", async () => {
        expect.assertions(1);
        try {
            await CampaignService.listCampaigns("id_user_0");
        }
        catch (err) {
            expect(err).toBeInstanceOf(InvalidDataError);
        }
    });
});

describe("update campaign", () => {
    afterEach(() => {
        Campaign._resetMockData();
    });

    it("should successfully update a existed campaign", async () => {
        const mockDoc = Campaign._mockData[0];

        const result = await CampaignService.updateCampaign("id_campaign_2", {
            name: "update campaign",
            start: "2020-01-24T12:30:00.000Z",
            end: "2020-01-25T12:30:00.000Z",
            options: [
                ...mockDoc.options.map(option => ({
                    id: option._id,
                    name: "update option",
                })),
                { name: "new option" },
            ],
        });

        expect(mockDoc._id).toBe("id_campaign_2");
        expect(mockDoc.name).toBe("update campaign");
        expect(mockDoc.start).toEqual(new Date("2020-01-24T12:30:00.000Z"));
        expect(mockDoc.end).toEqual(new Date("2020-01-25T12:30:00.000Z"));
        for (let i = 0; i < 3; i++) {
            expect(mockDoc.options[i]._id).toBe(`id_campaign_2_option_${i + 1}`);
            expect(mockDoc.options[i].name).toBe("update option");
        }
        expect(mockDoc.options[3].name).toBe("new option");
        expect(mockDoc.options[3].votes).toBe(0);
        expect(result.id).toBe("id_campaign_2");
        expect(result.name).toBe("update campaign");
        expect(result.start).toBe("2020-01-24T12:30:00.000Z");
        expect(result.end).toBe("2020-01-25T12:30:00.000Z");
        for (let i = 0; i < result.options.length; i++) {
            expect(result.options[i].id).toBeDefined();
        }
        expect(result.votes).toBe(mockDoc.votes);
    });

    it("should fail to update a existed campaign with invalid campaign id", async () => {
        expect.assertions(1);
        try {
            await CampaignService.updateCampaign("id_campaign_0", {
                name: "update campaign",
                start: "2020-01-24T12:30:00.000Z",
                end: "2020-01-25T12:30:00.000Z",
                options: [],
            });
        }
        catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });

    it("should fail to update a existed campaign with invalid option id", async () => {
        expect.assertions(1);
        try {
            const mockDoc = Campaign._mockData[0];

            const result = await CampaignService.updateCampaign("id_campaign_2", {
                name: "update campaign",
                start: "2020-01-24T12:30:00.000Z",
                end: "2020-01-25T12:30:00.000Z",
                options: [
                    ...mockDoc.options.map(option => ({
                        id: option._id,
                        name: "update option",
                    })),
                    {
                        id: "id_campaign_2_option_invalid",
                        name: "new option",
                    },
                ],
            });
        }
        catch (err) {
            expect(err).toBeInstanceOf(InvalidDataError);
        }
    });
});

describe("vote campaign", () => {
    afterEach(() => {
        Campaign._resetMockData();
    });

    it("should successfully vote a campaign by a valid user at first time only", async () => {
        expect.assertions(3);

        await CampaignService.voteCampaign("id_campaign_2", {
            userId: "id_user_1",
            hkid: "AB9876543",
            optionId: "id_campaign_2_option_2",
        });

        expect(redis.setVote).toHaveBeenCalledWith("id_campaign_2", "id_campaign_2_option_2", 0, [
            "id_campaign_2_option_1",
            "id_campaign_2_option_2",
            "id_campaign_2_option_3",
        ]);

        expect(Campaign.updateOne).toHaveBeenCalled();

        try {
            await CampaignService.voteCampaign("id_campaign_2", {
                userId: "id_user_1",
                hkid: "AB9876543",
                optionId: "id_campaign_2_option_2",
            });
        }
        catch (err) {
            expect(err).toBeInstanceOf(ForbiddenError);
        }
    });

    it("should fail to vote a campaign that not yet started", async () => {
        expect.assertions(1);

        Campaign._mockData[0].start = new Date(Date.now() + 60 * 60 * 1000);

        try {
            await CampaignService.voteCampaign("id_campaign_2", {
                userId: "id_user_1",
                hkid: "AB9876543",
                optionId: "id_campaign_2_option_2",
            });
        } catch (err) {
            expect(err).toBeInstanceOf(ForbiddenError);
        }
    });

    it("should fail to vote a campaign that is ended", async () => {
        expect.assertions(1);

        Campaign._mockData[0].end = new Date(Date.now() - 1000);

        try {
            await CampaignService.voteCampaign("id_campaign_2", {
                userId: "id_user_1",
                hkid: "AB9876543",
                optionId: "id_campaign_2_option_2",
            });
        } catch (err) {
            expect(err).toBeInstanceOf(ForbiddenError);
        }
    });

    it("should fail to vote a non-existed campaign", async () => {
        expect.assertions(1);

        try {
            await CampaignService.voteCampaign("id_campaign_0", {
                userId: "id_user_1",
                hkid: "AB9876543",
                optionId: "id_campaign_2_option_2",
            });
        } catch (err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });

    it("should fail to vote a existed campaign with invalid user", async () => {
        expect.assertions(1);

        try {
            await CampaignService.voteCampaign("id_campaign_2", {
                userId: "id_user_0",
                hkid: "AB9876543",
                optionId: "id_campaign_2_option_2",
            });
        } catch (err) {
            expect(err).toBeInstanceOf(InvalidDataError);
        }
    });

    it("should fail to vote a existed campaign with invalid user hkid", async () => {
        expect.assertions(1);

        try {
            await CampaignService.voteCampaign("id_campaign_2", {
                userId: "id_user_1",
                hkid: "A555551",
                optionId: "id_campaign_2_option_2",
            });
        } catch (err) {
            expect(err).toBeInstanceOf(InvalidDataError);
        }
    });
});
