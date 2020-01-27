const clonedeep = require("lodash.clonedeep");

//mock db documents
const documents = [
    {
        _id: "id_campaign_2",
        name: "Which HK CEO candidate you are preferred.",
        start: new Date(Date.now() - (24 * 60 * 60 * 1000)), //yesterday
        end: new Date(Date.now() + (24 * 60 * 60 * 1000)), //tomorrow,
        options: [
            {
                _id: "id_campaign_2_option_1",
                name: "Carrie Lam",
                votes: 1383902,
            },
            {
                _id: "id_campaign_2_option_2",
                name: "John Tsang",
                votes: 4040300,
            },
            {
                _id: "id_campaign_2_option_3",
                name: "Rebecca Ip",
                votes: 230030,
            },
        ],
        votes: 1383902 + 4040300 + 230030,
        save: jest.fn(() => {
            for (let i = 0; i < data[0].options.length; i++) {
                data[0].options[i]._id = data[0].options[i]._id || "id_campaign_2_option_new";
            }
        }),
    },
    {
        _id: "id_campaign_1",
        name: "Who is the best NBA player in the history",
        start: new Date(Date.now() - (24 * 60 * 60 * 1000)), //yesterday
        end: new Date(Date.now() + 24 * 60 * 60 * 1000), //tomorrow,
        options: [
            {
                _id: "id_campaign_1_option_1",
                name: "Michael Jordan",
                votes: 193839,
            },
            {
                _id: "id_campaign_1_option_2",
                name: "Kobe Bryant",
                votes: 30403,
            },
            {
                _id: "id_campaign_1_option_3",
                name: "Leborn James",
                votes: 50023,
            },
            {
                _id: "id_campaign_1_option_4",
                name: "Stephen Curry",
                votes: 60022,
            },
        ],
        votes: 193839 + 30403 + 50023 + 60022,
        save: jest.fn(() => {
            for (let i = 0; i < data[1].options.length; i++) {
                data[1].options[i]._id = data[1].options[i]._id || "id_campaign_2_option_new";
            }
        }),
    },
    {
        _id: "id_campaign_3",
        name: "Cmapaign 3",
        start: new Date(Date.now() - (24 * 60 * 60 * 1000)), //yesterday
        end: new Date(Date.now() - 1000), //just before
        options: [
            {
                _id: "id_campaign_3_option_1",
                name: "Option 1",
                votes: 60,
            },
            {
                _id: "",
                name: "Option 2",
                votes: 40,
            },
        ],
        votes: 60 + 40,
        save: jest.fn(() => {
            for (let i = 0; i < data[2].options.length; i++) {
                data[2].options[i]._id = data[2].options[i]._id || "id_campaign_2_option_new";
            }
        }),
    },
];

let data = clonedeep(documents);

module.exports = {
    create: jest.fn()
        .mockResolvedValue(data[0]),
    findOne: jest.fn(query => {
        const _id = query._id;
        for (let item of data) {
            if (item._id == query._id) {
                return {
                    lean() { return this; },
                    exec() { return Promise.resolve(item); }
                };
            }
        }
        return {
            lean() { return this; },
            exec() { return Promise.resolve(null); }
        };
    }),
    find: jest.fn()
        .mockReturnValue({
            lean() { return this; },
            sort() { return this; },
            exec() { return Promise.resolve(data); },
        }),
    updateOne: jest.fn()
        .mockReturnValue({
            exec: jest.fn().mockResolvedValue(data[0]),
        }),
    _mockData: data,
    _resetMockData() {
        data = clonedeep(documents);
        this._mockData = data;
    },
};
