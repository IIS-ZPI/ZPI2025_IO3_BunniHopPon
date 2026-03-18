package com.bunihoppon;

public class ArithmeticsDiv implements IArithmeticsDiv{

    @Override
    public double Division(double A, double B){
        if (B == 0) {
            System.out.println("Błąd: Dzielenie przez zero!");
        return 0;
        }
        
        return A / B;
    }
}
