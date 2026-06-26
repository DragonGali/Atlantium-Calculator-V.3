const data = {

    options: [
        'Full Range UV Systems',
        'Municipal Market under the EPA',
        'Decholoration | Ozone Decomposition'
    ],

    HODButtons: ['Regular', 'Ozone Free', 'VUV'],

    CalculatorVersionButtons: ['Developer', 'Marketing'],

    PlotFiguresButtons: ['PlotPlot Red = f(UVT)', 'Plot Red = f(Flow)', 'Plot Red = f(Rel.Drive)'],

    Specifications: {
        top: [
            ['Lamp Efficiency:', 25 , 100, '[% Efficiency]'],
            ['Relative Drive:', 40, 100, '[% Power]'],
            ['UVT-1cm @254nm:', 25, 99, '[%-1cm]'],
            ['UVT-1cm @215nm:', 0, 99, '[%-1cm]']
        ],

        bottom: {
                fieldName: "Flow rate:",

                options: [
                    {value: "[m³/hr]", label: "[m³/hr]"},
                    {value: "[US GPM]", label: "[US GPM]"}],

                ranges: [{min: 30, max: 360}, {min: 132, max: 1585}],

                buttons: ["Reset To Default Values", "Flow For Target Dose"]
        }
    },

    Results: [
        {fieldName: "Reduction Equivalent Dose (RED):", value: 67.6, scale: "[mj/cm²]"},
        {fieldName: "Head Loss (on HOD Systems Only):", value: 0.03, options: [{value: "[m/H₂O]", label: "[m/H₂O]"}, {value: "[cm/H₂O]", label: "[cm/H₂O]"}, {value: "[in/H₂O]", label: "[in/H₂O]"}, {value: "[bar]", label: "[bar]"}, {value: "[PSI]", label: ["PSI"]}]},
        {fieldName: "Maximum Electrical Power:", value: 1.705, scale: "[kW]"},
        {fieldName: "Est. avg. lamp power consumption:", value: 1.534, scale: "[kW]"}
    ],

    PathogenReduction: {
        treeView: {

            labels: [
                "Pathogen Type" , "1-Log Dose [mJ/cm²]"
            ],
            
            treeData : [
                    {
                    label: 'Deciduous',
                    children: [
                    { label: 'Birch' },
                    {
                        label: 'Maple',
                        children: [
                        { label: 'Field maple' },
                        { label: 'Red maple' },
                        { label: 'Sugar maple' }
                        ]
                    },
                    { label: 'Oak' }
                    ]
                },
                {
                    label: 'Coniferous',
                    children: [
                    { label: 'Cedar' },
                    { label: 'Pine' },
                    { label: 'Spruce' }
                    ]
                },
                {
                    label: 'Non-trees',
                    children: [
                    { label: 'Bamboo' },
                    { label: 'Cactus' },
                    { label: 'Fern' }
                    ]
                }
            ]},

        tableView: {

            labels: [
                "Pathogen Type" , "1-Log Dose [mJ/cm²]"
            ],
            
            tableData : [
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Clostridium Perfringens', oneLog: 3.0, twoLog: 6.0, threeLog: 9.0 },
                { name: 'E. Coli', oneLog: 3.0, twoLog: 6.0, threeLog: 9.0 },
                { name: 'Enterococcus Faecalis', oneLog: 4.6, twoLog: 9.2, threeLog: 13.8 },
                { name: 'Legionella Pneumophila', oneLog: 0.9, twoLog: 1.8, threeLog: 2.7 },
                { name: 'Listeria Monocytogenes', oneLog: 2.4, twoLog: 4.8, threeLog: 7.2 },
                { name: 'Pseudomonas Aeruginosa', oneLog: 5.5, twoLog: 11.0, threeLog: 16.5 },
                { name: 'Salmonella Typhimurium', oneLog: 2.5, twoLog: 5.0, threeLog: 7.5 },
                { name: 'Staphylococcus Aureus', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Streptococcus Faecalis', oneLog: 3.8, twoLog: 7.6, threeLog: 11.4 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
            ]
        },

        buttons : ["Display Tree View", "Display Table View", "Full Table"],

        FullTable: {
            title: "Pathogen Specific Log Inactivation [mJ/cm²] - Full Data Table",

            labels: [
                "Pathogen Type" , "1-Log", "1.5-Log", "2-Log", "2.5-Log", "3-Log", "3.5-Log", "4-Log", "4.5-Log", "5-Log", "5.5-Log"
            ],

            tableData: [
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, onePointFiveLog: 1.5, twoLog: 2.0, twoPointFiveLog: 2.5, threeLog: 3.0, threePointFiveLog: 3.5, fourLog: 4.0, fourPointFiveLog: 4.5, fiveLog: 5.0, fivePointFiveLog: 5.5 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, onePointFiveLog: 1.65, twoLog: 2.2, twoPointFiveLog: 2.75, threeLog: 3.3, threePointFiveLog: 3.85, fourLog: 4.4, fourPointFiveLog: 4.95, fiveLog: 5.5, fivePointFiveLog: 6.05 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, onePointFiveLog: 13.05, twoLog: 17.4, twoPointFiveLog: 21.75, threeLog: 26.1, threePointFiveLog: 30.45, fourLog: 34.8, fourPointFiveLog: 39.15, fiveLog: 43.5, fivePointFiveLog: 47.85 },
                { name: 'Bacillus Cereus', oneLog: 1.8, onePointFiveLog: 2.7, twoLog: 3.6, twoPointFiveLog: 4.5, threeLog: 5.4, threePointFiveLog: 6.3, fourLog: 7.2, fourPointFiveLog: 8.1, fiveLog: 9.0, fivePointFiveLog: 9.9 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, onePointFiveLog: 3.3, twoLog: 4.4, twoPointFiveLog: 5.5, threeLog: 6.6, threePointFiveLog: 7.7, fourLog: 8.8, fourPointFiveLog: 9.9, fiveLog: 11.0, fivePointFiveLog: 12.1 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, onePointFiveLog: 2.25, twoLog: 3.0, twoPointFiveLog: 3.75, threeLog: 4.5, threePointFiveLog: 5.25, fourLog: 6.0, fourPointFiveLog: 6.75, fiveLog: 7.5, fivePointFiveLog: 8.25 },
                { name: 'Clostridium Perfringens', oneLog: 3.0, onePointFiveLog: 4.5, twoLog: 6.0, twoPointFiveLog: 7.5, threeLog: 9.0, threePointFiveLog: 10.5, fourLog: 12.0, fourPointFiveLog: 13.5, fiveLog: 15.0, fivePointFiveLog: 16.5 },
                { name: 'E. Coli', oneLog: 3.0, onePointFiveLog: 4.5, twoLog: 6.0, twoPointFiveLog: 7.5, threeLog: 9.0, threePointFiveLog: 10.5, fourLog: 12.0, fourPointFiveLog: 13.5, fiveLog: 15.0, fivePointFiveLog: 16.5 },
                { name: 'Enterococcus Faecalis', oneLog: 4.6, onePointFiveLog: 6.9, twoLog: 9.2, twoPointFiveLog: 11.5, threeLog: 13.8, threePointFiveLog: 16.1, fourLog: 18.4, fourPointFiveLog: 20.7, fiveLog: 23.0, fivePointFiveLog: 25.3 },
                { name: 'Legionella Pneumophila', oneLog: 0.9, onePointFiveLog: 1.35, twoLog: 1.8, twoPointFiveLog: 2.25, threeLog: 2.7, threePointFiveLog: 3.15, fourLog: 3.6, fourPointFiveLog: 4.05, fiveLog: 4.5, fivePointFiveLog: 4.95 },
                { name: 'Clostridium Perfringens', oneLog: 3.0, onePointFiveLog: 4.5, twoLog: 6.0, twoPointFiveLog: 7.5, threeLog: 9.0, threePointFiveLog: 10.5, fourLog: 12.0, fourPointFiveLog: 13.5, fiveLog: 15.0, fivePointFiveLog: 16.5 },
                { name: 'E. Coli', oneLog: 3.0, onePointFiveLog: 4.5, twoLog: 6.0, twoPointFiveLog: 7.5, threeLog: 9.0, threePointFiveLog: 10.5, fourLog: 12.0, fourPointFiveLog: 13.5, fiveLog: 15.0, fivePointFiveLog: 16.5 },
                { name: 'Enterococcus Faecalis', oneLog: 4.6, onePointFiveLog: 6.9, twoLog: 9.2, twoPointFiveLog: 11.5, threeLog: 13.8, threePointFiveLog: 16.1, fourLog: 18.4, fourPointFiveLog: 20.7, fiveLog: 23.0, fivePointFiveLog: 25.3 },
                { name: 'Legionella Pneumophila', oneLog: 0.9, onePointFiveLog: 1.35, twoLog: 1.8, twoPointFiveLog: 2.25, threeLog: 2.7, threePointFiveLog: 3.15, fourLog: 3.6, fourPointFiveLog: 4.05, fiveLog: 4.5, fivePointFiveLog: 4.95 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
                { name: 'Aeromonas Handrohenus', oneLog: 1.0, twoLog: 2.0, threeLog: 4.6 },
                { name: 'Aeromonas Handrophila', oneLog: 1.1, twoLog: 2.6, threeLog: 3.9 },
                { name: 'Bacillus Anthracis', oneLog: 8.7, twoLog: 17.4, threeLog: 26.1 },
                { name: 'Bacillus Cereus', oneLog: 1.8, twoLog: 3.6, threeLog: 5.4 },
                { name: 'Bacillus Subtilis', oneLog: 2.2, twoLog: 4.4, threeLog: 6.6 },
                { name: 'Campylobacter Jejuni', oneLog: 1.5, twoLog: 3.0, threeLog: 4.5 },
            ]

        }

    },

    PathogenInactivation : {
        
    }
}

export default data;