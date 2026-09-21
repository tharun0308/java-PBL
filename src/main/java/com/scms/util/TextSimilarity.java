package com.scms.util;

import java.util.*;

/**
 * Text similarity and NLP utility for duplicate complaint detection and keyword scoring.
 */
public class TextSimilarity {

    public static List<String> tokenize(String text) {
        if (text == null) return Collections.emptyList();
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9]", " ");
        String[] parts = cleaned.split("\\s+");
        List<String> tokens = new ArrayList<>();
        for (String p : parts) {
            if (p.length() > 2) {
                tokens.add(p);
            }
        }
        return tokens;
    }

    public static boolean matchesLocation(String newLoc, String existingLoc) {
        if (newLoc == null || existingLoc == null) return false;
        List<String> newWords = tokenize(newLoc);
        if (newWords.isEmpty()) return false;

        String existingLower = existingLoc.toLowerCase();
        int matched = 0;
        for (String word : newWords) {
            if (existingLower.contains(word)) {
                matched++;
            }
        }

        if (newWords.size() == 1) {
            return matched >= 1;
        }
        return matched >= 2;
    }

    public static double computeJaccardSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;
        Set<String> set1 = new HashSet<>(tokenize(text1));
        Set<String> set2 = new HashSet<>(tokenize(text2));

        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / (double) union.size();
    }
}
