package com.bunihoppon.team;

public class TeamInfo {
    private static final String teamName = "BunniHopPon";
    private static final String scrumMasterFullName = "Andrii Bialkovskyi 253190";
    private static final TeamMember[] teamMembers = {
        new TeamMember("justkinou", "SCRUM Master / DevOps"),
        new TeamMember("lostbtw", "Tester"),
        new TeamMember("B1ona4y", "Developer"),
        new TeamMember("Kitavaxx", "Developer"),
        new TeamMember("mikita672", "Developer"),
    };

    public static void display() {
        IO.println(teamName + " " + scrumMasterFullName);
        for (TeamMember teamMember : teamMembers) {
            IO.println(teamMember.name() + " - " + teamMember.role());
        }
    }
}
