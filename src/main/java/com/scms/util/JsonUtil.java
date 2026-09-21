package com.scms.util;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;

/**
 * Pure Java SE JSON serialization and deserialization utility.
 * No external third-party JAR dependencies required.
 */
public class JsonUtil {

    // ==========================================
    // SERIALIZATION
    // ==========================================

    public static String toJson(Object obj) {
        if (obj == null) return "null";
        StringBuilder sb = new StringBuilder();
        serializeValue(obj, sb);
        return sb.toString();
    }

    private static void serializeValue(Object obj, StringBuilder sb) {
        if (obj == null) {
            sb.append("null");
        } else if (obj instanceof String) {
            sb.append('"').append(escapeJson((String) obj)).append('"');
        } else if (obj instanceof Number || obj instanceof Boolean) {
            sb.append(obj.toString());
        } else if (obj instanceof Enum<?>) {
            sb.append('"').append(((Enum<?>) obj).toString()).append('"');
        } else if (obj instanceof Map<?, ?>) {
            Map<?, ?> map = (Map<?, ?>) obj;
            sb.append("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                first = false;
                sb.append('"').append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                serializeValue(entry.getValue(), sb);
            }
            sb.append("}");
        } else if (obj instanceof Iterable<?>) {
            Iterable<?> iter = (Iterable<?>) obj;
            sb.append("[");
            boolean first = true;
            for (Object item : iter) {
                if (!first) sb.append(",");
                first = false;
                serializeValue(item, sb);
            }
            sb.append("]");
        } else if (obj.getClass().isArray()) {
            Object[] arr = (Object[]) obj;
            sb.append("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                serializeValue(arr[i], sb);
            }
            sb.append("]");
        } else {
            // POJO Object reflection
            sb.append("{");
            boolean first = true;
            Class<?> clazz = obj.getClass();
            while (clazz != null && clazz != Object.class) {
                Field[] fields = clazz.getDeclaredFields();
                for (Field f : fields) {
                    if (Modifier.isStatic(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
                        continue;
                    }
                    f.setAccessible(true);
                    try {
                        Object val = f.get(obj);
                        if (!first) sb.append(",");
                        first = false;
                        sb.append('"').append(f.getName()).append("\":");
                        serializeValue(val, sb);
                    } catch (Exception ignored) {}
                }
                clazz = clazz.getSuperclass();
            }
            sb.append("}");
        }
    }

    public static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        String hex = "000" + Integer.toHexString(c);
                        sb.append("\\u").append(hex.substring(hex.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    // ==========================================
    // PARSING (Recursive Descent Parser)
    // ==========================================

    public static Object parse(String json) {
        if (json == null) return null;
        json = json.trim();
        if (json.isEmpty()) return null;
        Parser parser = new Parser(json);
        return parser.parseValue();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String json) {
        Object res = parse(json);
        if (res instanceof Map) {
            return (Map<String, Object>) res;
        }
        return new HashMap<>();
    }

    @SuppressWarnings("unchecked")
    public static List<Object> parseArray(String json) {
        Object res = parse(json);
        if (res instanceof List) {
            return (List<Object>) res;
        }
        return new ArrayList<>();
    }

    private static class Parser {
        private final String src;
        private int pos = 0;

        Parser(String src) {
            this.src = src;
        }

        private void skipWhitespace() {
            while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) {
                pos++;
            }
        }

        private char peek() {
            skipWhitespace();
            return pos < src.length() ? src.charAt(pos) : '\0';
        }

        private char next() {
            skipWhitespace();
            return pos < src.length() ? src.charAt(pos++) : '\0';
        }

        public Object parseValue() {
            char c = peek();
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"') return parseString();
            if (c == 't' || c == 'f') return parseBoolean();
            if (c == 'n') return parseNull();
            if (Character.isDigit(c) || c == '-') return parseNumber();
            return null;
        }

        private Map<String, Object> parseObject() {
            Map<String, Object> map = new LinkedHashMap<>();
            next(); // consume '{'
            while (true) {
                char c = peek();
                if (c == '}' || c == '\0') {
                    if (c == '}') next();
                    break;
                }
                if (c == ',') {
                    next();
                    continue;
                }
                String key = parseString();
                skipWhitespace();
                if (peek() == ':') next(); // consume ':'
                Object val = parseValue();
                map.put(key, val);
                skipWhitespace();
                if (peek() == ',') next();
            }
            return map;
        }

        private List<Object> parseArray() {
            List<Object> list = new ArrayList<>();
            next(); // consume '['
            while (true) {
                char c = peek();
                if (c == ']' || c == '\0') {
                    if (c == ']') next();
                    break;
                }
                if (c == ',') {
                    next();
                    continue;
                }
                Object val = parseValue();
                list.add(val);
                skipWhitespace();
                if (peek() == ',') next();
            }
            return list;
        }

        private String parseString() {
            next(); // consume '"'
            StringBuilder sb = new StringBuilder();
            while (pos < src.length()) {
                char c = src.charAt(pos++);
                if (c == '"') break;
                if (c == '\\' && pos < src.length()) {
                    char esc = src.charAt(pos++);
                    switch (esc) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case '/': sb.append('/'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        case 'u':
                            if (pos + 4 <= src.length()) {
                                String hex = src.substring(pos, pos + 4);
                                pos += 4;
                                try {
                                    sb.append((char) Integer.parseInt(hex, 16));
                                } catch (Exception ignored) {}
                            }
                            break;
                        default: sb.append(esc);
                    }
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }

        private Boolean parseBoolean() {
            if (src.startsWith("true", pos)) {
                pos += 4;
                return Boolean.TRUE;
            }
            if (src.startsWith("false", pos)) {
                pos += 5;
                return Boolean.FALSE;
            }
            return null;
        }

        private Object parseNull() {
            if (src.startsWith("null", pos)) {
                pos += 4;
            }
            return null;
        }

        private Number parseNumber() {
            int start = pos;
            if (peek() == '-') pos++;
            while (pos < src.length() && (Character.isDigit(src.charAt(pos)) || src.charAt(pos) == '.' || src.charAt(pos) == 'e' || src.charAt(pos) == 'E' || src.charAt(pos) == '+' || src.charAt(pos) == '-')) {
                pos++;
            }
            String numStr = src.substring(start, pos);
            try {
                if (numStr.contains(".") || numStr.contains("e") || numStr.contains("E")) {
                    return Double.parseDouble(numStr);
                }
                long l = Long.parseLong(numStr);
                if (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) {
                    return (int) l;
                }
                return l;
            } catch (Exception e) {
                return 0;
            }
        }
    }
}
