package com.bunihoppon;

import com.bunihoppon.arithmetics.Add.ArithmeticsAdd;
import com.bunihoppon.arithmetics.Diff.ArithmeticsDiff;
import com.bunihoppon.arithmetics.Div.ArithmeticsDiv;
import com.bunihoppon.arithmetics.Mult.ArithmeticsMult;

public class Main {
    private static final String teamName = "BunniHopPon";
    private static final String scrumMasterFullName = "Andrii Bialkovskyi 253190";
    private record TeamMember(String name, String role) {}
    private static final TeamMember[] teamMembers = {
        new TeamMember("justkinou", "SCRUM Master / DevOps"),
        new TeamMember("lostbtw", "Tester"),
        new TeamMember("B1ona4y", "Developer"),
        new TeamMember("Kitavaxx", "Developer"),
        new TeamMember("mikita672", "Developer"),
    };

    void main(String[] args) {
        IO.println(teamName + " " + scrumMasterFullName);
        for (TeamMember teamMember : teamMembers) {
            IO.println(teamMember.name + " - " + teamMember.role);
        }

        testArithmetics();
    }

    public static void testArithmetics() {
        IO.println("=== Add test ===");
        ArithmeticsAdd aadd = new ArithmeticsAdd();
        IO.println(aadd.Addition(10, 2));

        IO.println("=== Diff test ===");
        ArithmeticsDiff adiff = new ArithmeticsDiff();
        IO.println(adiff.Difference(10, 2));

        IO.println("=== Mult test ===");
        ArithmeticsMult amult = new ArithmeticsMult();
        IO.println(amult.Multiplication(10, 2));

        IO.println("=== Div test ===");
        ArithmeticsDiv adiv = new ArithmeticsDiv();
        IO.println(adiv.Division(10, 2));

        IO.println("=== Div test 2 ===");
        try {
            IO.println(adiv.Division(10, 0));
        } catch (ArithmeticException e) {
            IO.println(e);
        }
    }
}