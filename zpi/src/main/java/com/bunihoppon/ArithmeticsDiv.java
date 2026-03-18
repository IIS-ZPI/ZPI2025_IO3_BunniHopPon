package com.bunihoppon;

public class ArithmeticsDiv implements IArithmeticsDiv {
    @Override
    public double Division(double A, double B) {
        if (B == 0.0) {
            throw new ArithmeticException("Division by zero");
        }

        return A / B;
    }
}
