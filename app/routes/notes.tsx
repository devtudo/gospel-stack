import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import {
  Button,
  Divider,
  Flex,
  Heading,
  List,
  ListItem,
  Stack,
  chakra,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getNoteListItems } from "~/models/note.server";
import { ChakraRemixLink } from "~/components/factory";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

type LoaderData = {
  noteListItems: Awaited<ReturnType<typeof getNoteListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const noteListItems = await getNoteListItems({ userId });
  return json<LoaderData>({ noteListItems });
};

export default function NotesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex h="full" minH="screenY" direction="column">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        bg={useColorModeValue("gray.100", "gray.900")}
        p="2"
      >
        <Heading fontSize="3xl">
          <ChakraRemixLink to=".">Notes</ChakraRemixLink>
        </Heading>
        <Stack direction="row" spacing={4} align="center">
          <Text>{user.email}</Text>
          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
          <Form action="/logout" method="post">
            <Button type="submit" colorScheme="red" size="sm">
              Logout
            </Button>
          </Form>
        </Stack>
      </Flex>

      <Flex as="main" h="full" bg="white">
        <Stack
          h="full"
          w="80"
          borderRightWidth="1px"
          bg="gray.50"
          spacing="0"
          divider={<Divider />}
        >
          <ChakraRemixLink
            to="new"
            p="4"
            fontSize="xl"
            bg={useColorModeValue("gray.100", "gray.900")}
          >
            + New Note
          </ChakraRemixLink>

          {data.noteListItems.length === 0 ? (
            <chakra.p p="4">No notes yet</chakra.p>
          ) : (
            <List>
              {data.noteListItems.map((note) => (
                <NavLink to={note.id} key={note.id}>
                  {({ isActive }) => (
                    <ListItem
                      p="4"
                      bg={
                        colorMode === "light" && isActive
                          ? "blue.100"
                          : colorMode === "light" && !isActive
                          ? ""
                          : colorMode === "dark" && isActive
                          ? "purple.900"
                          : colorMode === "dark" && !isActive
                          ? "gray.200"
                          : ""
                      }
                      borderBottomWidth="1px"
                      fontSize="xl"
                    >
                      <Text
                        color={colorMode === "dark" && !isActive ? "black" : ""}
                      >
                        📝 {note.title}
                      </Text>
                    </ListItem>
                  )}
                </NavLink>
              ))}
            </List>
          )}
        </Stack>

        <chakra.div flex="1" p="6" bg={useColorModeValue("", "gray.800")}>
          <Outlet />
        </chakra.div>
      </Flex>
    </Flex>
  );
}
