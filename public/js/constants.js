const countries = [
    {
        name: 'Poland',
        name_pl: 'Polska',
        code: 'pl',
        regionBordersUrl: 'data/poland.json?override_cache=deploy_version',
        regionLabelsUrl: 'data/poland-labels.json?override_cache=deploy_version',
        industries: [
            {
                name: 'Photovoltaic',
                boardId: '1284229859',
                clientsCsvUrl:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXX8s55OGAtinS512CxTofxeajnRk6l8yWtMslGSoY9rrgPUMAdxktZvcD_MfHPpKTghv_niiDPcHh/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Heat Pumps',
                boardId: '1296342797',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRd_AvAtUBzqVqmGS2V6xUXwqeOSklIewuJd_RUEigTX4YFkBuoLTW7zHfjIqwQFr7ZLEdYcDMdjRXy/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Thermal Modernization',
                boardId: '1323630417',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQh7p_EBtwAkRfGbRcswXe_dFCg3g05cfGikBQPV8_ur9l_4kBNKK9kj8ET3nFyIxck6d37UW9QcjJj/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'SKD',
                boardId: '1410697073',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnJxEHg9Dk74Hz0_CR_sBDnVIZXoDfvYH1D3boNi20f6jIYQpM7Gk2CQ3LhqgMuLkZKzl7DzaQZxtE/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Swiss Franc Loans',
                boardId: '1305290023',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtebdLiHbYFqFjZNSXuTD3-u6z4lAZhQPA4lL9Q6uzYM5jK0OE9OcN98D0WlbHnVvxa8z6SRIbWDLZ/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Upadłość Konsumencka',
                boardId: '1425325850',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBFzm8qAdobRJeiUdnGCEzxWBQIzHMZE8NOHuqtLbZTBnNg8UrSNoPiArmvk5IcCP47aSgeeQI-fjz/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Real Estate Brokerage',
                boardId: '1301678781',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxbF8yqlofuTbU3H1J8xVrimCwMBPFjz6OGO9g5fyfu1gpnyGjxZckri5JyWkaOsMj0-Dc_4WISFn2/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Air conditioning',
                boardId: '1297441890',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR71y8KUbb4QGNXdT3sZrfeX9ElXqNSXYidJrIgOXXdK62WiOzcXcMhF6gGAmxwNlkHuYrbPYGv__gx/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Interior Architecture',
                boardId: '1380550342',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIXbPieBDTrJyANoXo4DKZ7PnJwpoMadCHQch0_qTv4nk87MmmDa6OI88FO2-VrYrWYq9G4b_Bhee1/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Restrukturyzacja',
                boardId: '1488425558',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTE3rCMYqe8MWpAwVxk2jrfc7lBtgopMY0Mr8nltXDwDiHnEnz0A_TSI9KTAR8uvsFb842DLF27ZHFw/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Mycie Wysokocisnieniowe',
                boardId: '1492985411',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSO9nyE765ADOQA6gzCQ61nRZ8df2YsQecic9iI_7b4ubTUFBvdINz2uPrEupNxf7OiVu2wpoh8JVwe/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Hiszpania Nieruchomości',
                boardId: '1502401021',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0kBhnifSX9knEhDC62XBLFF3NhBaM_H8m40cXyNUYzn8jqNQPUv-8cEyMQPP1d2T4DTEuD9qWkWci/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Energia Elektryczna',
                boardId: '1504535281',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAcuDyWS5Xx2hF0_gNnk054YjONO_CQq7OgzF-MqOQ1IRQ9J4gZ7Lgg8BTwHSS0Vp4tA9MRJ9hp7rl/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Kredyty Dla Firm',
                boardId: '1513295538',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-uD8Ajqj8q-h9c8uzoQL4wOmIGdFTwVVp0I1vEZM5ui1KlmEa48o6RCW7q1SAQjORGHpa_5TWDqli/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Obsługa Prawna Firm',
                boardId: '1535731255',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbwoBIiQ4qpXZntcl5nLBlmH7GriFstHn6FVeNJb6d6TvH5Q60p-rymqXyZ807B-vqAMgGAU83p9Ny/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Leasing',
                boardId: '1653725752',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPlzbrokxmZCnG7CzqnTGZc-2nf0VLRc7xTy4DqLQO0ri25pwd1yP5jlmgfId9hXKChA3pAOB5W75d/pub?gid=0&single=true&output=csv'
            }
        ]
    },
    {
        name: 'Spain',
        name_pl: 'Spain',
        code: 'es',
        regionBordersUrl: 'data/spain.json?override_cache=deploy_version',
        regionLabelsUrl: 'data/spain-labels.json?override_cache=deploy_version',
        industries: [
            {
                name: 'Photovoltaic',
                boardId: '1301398021',
                clientsCsvUrl:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3ttlITYNcezgWgKPGjwaJadcE_X6xXkTvmcNPrbJLLtKU11ygB6ia6rh3ldLKuf2zFdTs88sSse3X/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Real Estate',
                boardId: '1486362709',
                clientsCsvUrl:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSNPxxGmPJ3-wH2lG8cMtv9ppYS33vRofhhRu4hlV-UO9EMiOIJLx0SvYBDwtfT_AFfBzSVEC0MRxz/pub?gid=0&single=true&output=csv'
            }
        ]
    },
    {
        name: 'France',
        name_pl: 'France',
        code: 'fr',
        regionBordersUrl: 'data/france.json',
        industries: [
            {
                name: 'Photovoltaic',
                boardId: '1587738740',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBku503RZH8jZvMLCcNXecu0F5DtoupuMMTCjVD0yNjazgeq5zW3KDLKNUFwLGeb8QIq4ob9wYMt9i/pub?gid=0&single=true&output=csv'
            }
        ]
    },
    {
        name: 'Germany',
        name_pl: 'Germany',
        code: 'de',
        regionBordersUrl: 'data/germany.json',
        regionLabelsUrl: 'data/germany-labels.json',
        industries: [
            {
                name: 'Photovoltaic',
                boardId: '1299880499',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKMn1ATKbL8U-LrHcOCL6LfKVxQxROOZvsJomQuHd8uMne3A-EiQYFqTRVVKRgzkMS1mWM6eP9hSmj/pub?gid=0&single=true&output=csv'
            },
            {
                name: 'Heat Pumps',
                boardId: '1509270654',
                clientsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbvWtWKK6w1SR9fBsIO4p51RKdplq-xetOB447flaAMbMAxv-sizUU8k5DnPVy6xApM_AZUjxw4fL3/pub?gid=0&single=true&output=csv'
            }
        ]
    },
    {
        name: 'UK',
        code: 'uk',
        regionBordersUrl: 'data/uk.json',
        regionLabelsUrl: 'data/uk-labels.json',
        industries: [

        ]
    }
];

/* const clients = [
    {
        name:'Test Client',
        regions:[
            'mazowieckie', 
            'świętokrzyskie', 
            'podkarpackie', 
            'lubelskie',
            'pomorskie'
        ]
    },
    {
        name:'Test Client 2',
        regions:[
            'pomorskie'
        ]
    }
] */
